import type { Request } from 'express';

export function getRequestId(req: Request): string | undefined {
    const id = (req as Request & { requestId?: string }).requestId;
    return typeof id === 'string' && id.length > 0 ? id : undefined;
}

export function getUserIdFromRequest(req: Request): string | undefined {
    const q = (req.query ?? {}) as Record<string, unknown>;
    const body = (req.body ?? {}) as Record<string, unknown>;

    const fromQuery = q.username;
    if (typeof fromQuery === 'string' && fromQuery.trim()) return fromQuery.trim().toLowerCase();

    const candidates = [body.owner, body.username, body.userId, body.githubUsername];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate.trim().toLowerCase();
        }
    }

    return undefined;
}

export function summarizeRepos(repos: unknown): { repoCount?: number; reposSample?: string[] } {
    if (!Array.isArray(repos)) return {};
    const names = repos.filter((r) => typeof r === 'string') as string[];
    const repoCount = names.length;
    const reposSample = names.slice(0, 5);
    return { repoCount, reposSample };
}
