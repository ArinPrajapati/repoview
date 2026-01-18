import { Router } from 'express';
import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/user?username={github_username}
router.get('/', async (req, res) => {
    try {
        const { username } = req.query;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'GitHub username is required' });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.githubUsername, username.toLowerCase()),
        });

        if (!user) {
            return res.json({ isPremium: false });
        }

        return res.json({ isPremium: user.isPremium });
    } catch (error) {
        console.error('Error checking user:', error);
        return res.status(500).json({ error: 'Failed to check user status' });
    }
});

export default router;
