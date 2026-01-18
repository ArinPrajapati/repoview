import { Router } from 'express';
import { db } from '../db/index';
import { users } from '../db/schema';
import type { GumroadPingPayload } from '../types/index';

const router = Router();

// POST /api/webhook/gumroad
router.post('/gumroad', async (req, res) => {
    try {
        const payload = req.body as GumroadPingPayload;

        // Verify seller_id to prevent spoofed requests
        const expectedSellerId = process.env.GUMROAD_SELLER_ID;
        if (expectedSellerId && payload.seller_id !== expectedSellerId) {
            console.warn('Invalid seller_id in Gumroad webhook:', payload.seller_id);
            return res.status(403).json({ error: 'Invalid seller' });
        }

        // Check if refunded or disputed
        if (payload.refunded === 'true' || payload.disputed === 'true') {
            console.log('Skipping refunded/disputed purchase:', payload.sale_id);
            return res.status(200).json({ success: true, message: 'Skipped refunded/disputed' });
        }

        const email = payload.email.toLowerCase();

        // Upsert user as premium
        await db
            .insert(users)
            .values({
                email,
                isPremium: true,
                purchaseDate: new Date(payload.sale_timestamp),
            })
            .onConflictDoUpdate({
                target: users.email,
                set: {
                    isPremium: true,
                    purchaseDate: new Date(payload.sale_timestamp),
                },
            });

        console.log('User marked as premium:', email);

        // Return 200 to acknowledge receipt
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error processing Gumroad webhook:', error);
        // Return 500 so Gumroad retries
        return res.status(500).json({ error: 'Failed to process webhook' });
    }
});

export default router;
