const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  const res = await fetch(`${API_URL}/api/repos?username=${encodeURIComponent(username)}`);
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
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, repos }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || error.error || 'Failed to analyze repos');
  }
  return res.json();
}

// Check premium status
export async function checkPremiumStatus(username: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/user?username=${encodeURIComponent(username)}`);
  if (!res.ok) return false;
  const data = await res.json();
  return data.isPremium;
}

// Generate PDF
export async function generatePdf(
  username: string,
  analyses: AnalysisResult[]
): Promise<Blob> {
  const res = await fetch(`${API_URL}/api/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, analyses }),
  });
  if (!res.ok) {
    throw new Error('Failed to generate PDF');
  }
  return res.blob();
}
