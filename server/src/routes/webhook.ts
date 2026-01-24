import { Router } from 'express';
import { db } from '../db/index';
import { users } from '../db/schema';
import type { GumroadPingPayload } from '../types/index';
import { logger, redactEmail } from '../lib/logger';

const router = Router();

// POST /api/webhook/gumroad
// Gumroad sends purchase data here after successful payment
// GitHub username is passed via url_params (custom field in checkout link)
router.post('/gumroad', async (req, res) => {
    try {
        const payload = req.body as GumroadPingPayload;

        // Verify seller_id to prevent spoofed requests
        const expectedSellerId = process.env.GUMROAD_SELLER_ID;
        if (expectedSellerId && payload.seller_id !== expectedSellerId) {
            logger.warn(
                {
                    requestId: req.requestId,
                    function: 'POST /api/webhook/gumroad',
                    params: { seller_id: payload.seller_id, sale_id: payload.sale_id },
                },
                'gumroad_invalid_seller'
            );
            return res.status(403).json({ error: 'Invalid seller' });
        }

        // Check if refunded or disputed
        if (payload.refunded === 'true' || payload.disputed === 'true') {
            logger.info(
                {
                    requestId: req.requestId,
                    function: 'POST /api/webhook/gumroad',
                    params: { sale_id: payload.sale_id, refunded: payload.refunded, disputed: payload.disputed },
                },
                'gumroad_skipped_refund_or_dispute'
            );
            return res.status(200).json({ success: true, message: 'Skipped refunded/disputed' });
        }

        // Get GitHub username from url_params (passed via checkout link)
        // Expected format: ?github_username=username
        const githubUsername = payload.url_params?.github_username?.toLowerCase();
        
        if (!githubUsername) {
            logger.error(
                {
                    requestId: req.requestId,
                    function: 'POST /api/webhook/gumroad',
                    params: { sale_id: payload.sale_id },
                    error: new Error('Missing github_username in url_params'),
                },
                'gumroad_missing_github_username'
            );
            return res.status(400).json({ error: 'Missing GitHub username' });
        }

        const email = payload.email.toLowerCase();

        // Upsert user as premium (keyed by GitHub username)
        await db
            .insert(users)
            .values({
                githubUsername,
                email,
                isPremium: true,
                purchaseDate: new Date(payload.sale_timestamp),
            })
            .onConflictDoUpdate({
                target: users.githubUsername,
                set: {
                    email, // Update email if they buy again with different email
                    isPremium: true,
                    purchaseDate: new Date(payload.sale_timestamp),
                },
            });

        logger.info(
            {
                requestId: req.requestId,
                userId: githubUsername,
                function: 'POST /api/webhook/gumroad',
                params: {
                    sale_id: payload.sale_id,
                    product_id: payload.product_id,
                    email: redactEmail(email),
                },
            },
            'gumroad_user_marked_premium'
        );

        // Return 200 to acknowledge receipt
        return res.status(200).json({ success: true });
    } catch (error) {
        logger.error(
            {
                requestId: req.requestId,
                function: 'POST /api/webhook/gumroad',
                error,
            },
            'gumroad_webhook_failed'
        );
        // Return 500 so Gumroad retries
        return res.status(500).json({ error: 'Failed to process webhook' });
    }
});

export default router;
