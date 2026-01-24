import { Router } from 'express';
import { logger } from '../lib/logger';
import { getUserIdFromRequest } from '../lib/requestContext';

type TelemetryEvent = {
    timestamp?: string;
    event: string;
    userId?: string;
    anonymousId?: string;
    page?: string;
    element?: string;
    action?: string;
    requestId?: string;
    properties?: Record<string, unknown>;
};

const router = Router();

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coerceEvents(body: unknown): unknown[] {
    if (Array.isArray(body)) return body;
    if (isPlainObject(body) && Array.isArray(body.events)) return body.events;
    return [body];
}

function validateEvent(raw: unknown): TelemetryEvent | null {
    if (!isPlainObject(raw)) return null;
    if (typeof raw.event !== 'string' || raw.event.trim().length === 0) return null;

    const event: TelemetryEvent = {
        timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : undefined,
        event: raw.event.trim(),
        userId: typeof raw.userId === 'string' ? raw.userId : undefined,
        anonymousId: typeof raw.anonymousId === 'string' ? raw.anonymousId : undefined,
        page: typeof raw.page === 'string' ? raw.page : undefined,
        element: typeof raw.element === 'string' ? raw.element : undefined,
        action: typeof raw.action === 'string' ? raw.action : undefined,
        requestId: typeof raw.requestId === 'string' ? raw.requestId : undefined,
        properties: isPlainObject(raw.properties) ? raw.properties : undefined,
    };

    return event;
}

// POST /api/telemetry
router.post('/', (req, res) => {
    const eventsRaw = coerceEvents(req.body);

    if (eventsRaw.length === 0) {
        return res.status(400).json({ error: 'No events provided' });
    }

    if (eventsRaw.length > 50) {
        return res.status(413).json({ error: 'Too many events in one request (max 50)' });
    }

    const requestUserId = getUserIdFromRequest(req);

    const valid: TelemetryEvent[] = [];
    for (const raw of eventsRaw) {
        const ev = validateEvent(raw);
        if (!ev) {
            return res.status(400).json({ error: 'Invalid event payload' });
        }
        valid.push(ev);
    }

    for (const ev of valid) {
        logger.info(
            {
                type: 'telemetry',
                requestId: req.requestId,
                clientRequestId: ev.requestId,
                userId: (ev.userId ?? requestUserId)?.toLowerCase(),
                event: ev.event,
                page: ev.page,
                element: ev.element,
                action: ev.action,
                anonymousId: ev.anonymousId,
                timestamp: ev.timestamp,
                properties: ev.properties,
                route: `${req.method} ${req.originalUrl}`,
            },
            'telemetry_event'
        );
    }

    return res.status(204).send();
});

export default router;
