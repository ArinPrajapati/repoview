import { Router } from 'express';
import reposRouter from './repos';
import analyzeRouter from './analyze';
import pdfRouter from './pdf';
import userRouter from './user';
import webhookRouter from './webhook';
import telemetryRouter from './telemetry';

const router = Router();

router.use('/repos', reposRouter);
router.use('/analyze', analyzeRouter);
router.use('/pdf', pdfRouter);
router.use('/user', userRouter);
router.use('/webhook', webhookRouter);
router.use('/telemetry', telemetryRouter);

export default router;
