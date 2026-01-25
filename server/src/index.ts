import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import apiRouter from './routes/index';
import { logger } from './lib/logger';
import { getUserIdFromRequest } from './lib/requestContext';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For Gumroad webhook

// Request correlation + JSON-line request logging
app.use((req, res, next) => {
  const incoming = req.header('x-request-id');
  const requestId = typeof incoming === 'string' && incoming.trim()
    ? incoming.trim().slice(0, 128)
    : randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
});

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info(
      {
        requestId: req.requestId,
        userId: getUserIdFromRequest(req),
        route: `${req.method} ${req.originalUrl}`,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs),
      },
      'request'
    );
  });

  next();
});

// Mount API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Safety net error handler (structured JSON-line)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(
    {
      requestId: req.requestId,
      userId: getUserIdFromRequest(req),
      route: `${req.method} ${req.originalUrl}`,
      error: err,
    },
    'unhandled_error'
  );
  res.status(500).json({ error: 'Internal server error', requestId: req.requestId });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, `RepoView API running on http://localhost:${PORT}`);
});

export default app;
