import { Router } from 'express';
import { fetchUserRepos } from '../lib/github';

const router = Router();

// GET /api/repos?username={username}
router.get('/', async (req, res) => {
    try {
        const { username } = req.query;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'Username is required' });
        }

        const repos = await fetchUserRepos(username);

        return res.json({
            repos,
            totalCount: repos.length,
        });
    } catch (error) {
        console.error('Error fetching repos:', error);

        if (error instanceof Error && error.message.includes('Not Found')) {
            return res.status(404).json({ error: 'GitHub user not found' });
        }

        return res.status(500).json({ error: 'Failed to fetch repositories' });
    }
});

export default router;
