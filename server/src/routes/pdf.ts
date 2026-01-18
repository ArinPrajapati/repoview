import { Router } from 'express';
import { generatePdfReport } from '../lib/pdf';
import type { AnalysisResult } from '../types/index';

const router = Router();

// POST /api/pdf
router.post('/', async (req, res) => {
    try {
        const { username, analyses } = req.body as {
            username: string;
            analyses: AnalysisResult[];
        };

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'username is required' });
        }

        if (!analyses || !Array.isArray(analyses) || analyses.length === 0) {
            return res.status(400).json({ error: 'analyses array is required' });
        }

        const pdfBuffer = await generatePdfReport(username, analyses);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="repoview-${username}.pdf"`);
        return res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

export default router;
