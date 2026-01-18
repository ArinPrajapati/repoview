import { Octokit } from '@octokit/rest';
import type { Repository } from '../types/index';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
});

export async function fetchUserRepos(username: string): Promise<Repository[]> {
    const { data } = await octokit.repos.listForUser({
        username,
        sort: 'updated',
        per_page: 100,
    });

    return data.map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count ?? 0,
        forks: repo.forks_count ?? 0,
        language: repo.language ?? null,
        updatedAt: repo.updated_at ?? new Date().toISOString(),
        defaultBranch: repo.default_branch ?? 'main',
    }));
}

export async function fetchRepoContents(
    owner: string,
    repo: string,
    path: string = ''
): Promise<string[]> {
    try {
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path,
        });

        if (Array.isArray(data)) {
            return data.map((item) => item.path);
        }
        return [];
    } catch {
        return [];
    }
}

export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
    try {
        const { data } = await octokit.repos.getReadme({
            owner,
            repo,
        });

        if ('content' in data && data.content) {
            return Buffer.from(data.content, 'base64').toString('utf-8');
        }
        return null;
    } catch {
        return null;
    }
}

export async function fetchCommits(
    owner: string,
    repo: string,
    limit: number = 100
): Promise<{ sha: string; date: string }[]> {
    try {
        const { data } = await octokit.repos.listCommits({
            owner,
            repo,
            per_page: limit,
        });

        return data.map((commit) => ({
            sha: commit.sha,
            date: commit.commit.author?.date ?? new Date().toISOString(),
        }));
    } catch {
        return [];
    }
}
