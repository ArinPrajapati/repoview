const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

import { analytics, newClientRequestId } from '@/lib/analytics';

async function apiFetch(input: string, init?: RequestInit, meta?: { userId?: string }) {
  const requestId = newClientRequestId();
  const url = input.startsWith('http') ? input : `${API_URL}${input}`;

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        'X-Request-Id': requestId,
      },
    });

    if (!res.ok) {
      let message: string | undefined;
      try {
        const err = await res.clone().json();
        message = err?.message || err?.error;
      } catch {
        // ignore
      }

      analytics.trackApiFail({
        method: init?.method ?? 'GET',
        url,
        status: res.status,
        message,
        requestId,
        userId: meta?.userId,
      });
    }

    return { res, requestId };
  } catch (e) {
    analytics.trackApiFail({
      method: init?.method ?? 'GET',
      url,
      message: e instanceof Error ? e.message : String(e),
      requestId,
      userId: meta?.userId,
    });
    throw e;
  }
}

export interface Repository {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
}

export interface CheckResult {
  checkName: string;
  category: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  message: string;
  suggestion?: string;
}

export interface AnalysisResult {
  repoName: string;
  repoUrl: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  tier: 'strong' | 'decent' | 'weak' | 'poor';
  checks: CheckResult[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface UsageInfo {
  reposAnalyzed: number;
  limit: number | null;
  isPremium: boolean;
}

// Fetch public repos for a GitHub user
export async function fetchRepos(username: string): Promise<Repository[]> {
  const { res } = await apiFetch(`/api/repos?username=${encodeURIComponent(username)}`, undefined, { userId: username });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch repos');
  }
  const data = await res.json();
  return data.repos;
}

// Analyze selected repos
export async function analyzeRepos(
  owner: string,
  repos: string[]
): Promise<{ analyses: AnalysisResult[]; usage: UsageInfo }> {
  const { res } = await apiFetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, repos }),
  }, { userId: owner });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || error.error || 'Failed to analyze repos');
  }
  return res.json();
}

// Check premium status
export async function checkPremiumStatus(username: string): Promise<boolean> {
  const { res } = await apiFetch(`/api/user?username=${encodeURIComponent(username)}`, undefined, { userId: username });
  if (!res.ok) return false;
  const data = await res.json();
  return data.isPremium;
}

// Generate PDF
export async function generatePdf(
  username: string,
  analyses: AnalysisResult[]
): Promise<Blob> {
  const { res } = await apiFetch('/api/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, analyses }),
  }, { userId: username });
  if (!res.ok) {
    throw new Error('Failed to generate PDF');
  }
  return res.blob();
}
