import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { analyzeRepository } from '../lib/rules/index';
import { db } from '../db/index';
import { users, analysisUsage } from '../db/schema';

const router = Router();
const FREE_TIER_LIMIT = 3;

// POST /api/analyze
router.post('/', async (req, res) => {
    try {
        const { repos, owner } = req.body;

        if (!repos || !Array.isArray(repos) || repos.length === 0) {
            return res.status(400).json({ error: 'repos array is required' });
        }

        if (!owner || typeof owner !== 'string') {
            return res.status(400).json({ error: 'owner is required' });
        }

        const githubUsername = owner.toLowerCase();

        // Check if this GitHub account is premium
        const user = await db.query.users.findFirst({
            where: eq(users.githubUsername, githubUsername),
        });
        const isPremium = user?.isPremium ?? false;

        // 1. Ensure usage record exists (handle concurrency)
        await db
            .insert(analysisUsage)
            .values({
                githubUsername,
                reposAnalyzed: 0,
            })
            .onConflictDoNothing();

        // 2. Fetch the current usage
        let usage = await db.query.analysisUsage.findFirst({
            where: eq(analysisUsage.githubUsername, githubUsername),
        });

        if (!usage) {
            // Should be impossible after insert
            throw new Error('Failed to initialize usage record');
        }

        // Enforce limit for free tier
        if (!isPremium) {
            const remaining = FREE_TIER_LIMIT - usage.reposAnalyzed;
            console.log('Remaining:', remaining);
            
            if (remaining <= 0) {
                return res.status(403).json({
                    error: 'Free tier limit reached',
                    message: `Free tier limit reached for @${owner}. Only ${FREE_TIER_LIMIT} repos can be analyzed. Upgrade to Pro for unlimited access.`,
                    reposAnalyzed: usage.reposAnalyzed,
                    limit: FREE_TIER_LIMIT,
                });
            }

            // Check if request exceeds remaining quota
            if (repos.length > remaining) {
                return res.status(400).json({
                    error: 'Exceeds free tier limit',
                    message: `You can only analyze ${remaining} more repo(s) for @${owner}. Upgrade to Pro for unlimited access.`,
                    remaining,
                    limit: FREE_TIER_LIMIT,
                });
            }
        }

        // Run analysis
        const analyses = await Promise.all(
            repos.map((repoName: string) => analyzeRepository(owner, repoName))
        );

        // Update usage count
        await db
            .update(analysisUsage)
            .set({
                reposAnalyzed: usage.reposAnalyzed + repos.length,
                lastAnalyzedAt: new Date(),
            })
            .where(eq(analysisUsage.githubUsername, githubUsername));

        return res.json({
            analyses,
            usage: {
                reposAnalyzed: usage.reposAnalyzed + repos.length,
                limit: isPremium ? null : FREE_TIER_LIMIT,
                isPremium,
            },
        });
    } catch (error) {
        console.error('Error analyzing repos:', error);
        return res.status(500).json({ error: 'Failed to analyze repositories' });
    }
});

export default router;
