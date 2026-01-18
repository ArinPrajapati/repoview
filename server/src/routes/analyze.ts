import { Router } from 'express';
import { analyzeRepository } from '../lib/rules/index';

const router = Router();

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

        const analyses = await Promise.all(
            repos.map((repoName: string) => analyzeRepository(owner, repoName))
        );

        return res.json({ analyses });
    } catch (error) {
        console.error('Error analyzing repos:', error);
        return res.status(500).json({ error: 'Failed to analyze repositories' });
    }
});

export default router;
