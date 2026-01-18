// Repository from GitHub API
export interface Repository {
    name: string;
    description: string | null;
    url: string;
    stars: number;
    forks: number;
    language: string | null;
    updatedAt: string;
    defaultBranch: string;
}

// Individual check result
export interface CheckResult {
    checkName: string;
    category: 'readme' | 'commits' | 'structure' | 'testing' | 'deployment' | 'practices';
    passed: boolean;
    points: number;
    maxPoints: number;
    message: string;
    suggestion?: string;
}

// Analysis result for a single repo
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

// User in database (keyed by GitHub username)
export interface User {
    githubUsername: string;
    email: string;
    isPremium: boolean;
    purchaseDate: Date | null;
    createdAt: Date;
}

// Gumroad webhook payload
export interface GumroadPingPayload {
    seller_id: string;
    product_id: string;
    product_name: string;
    email: string;
    price: string;
    sale_id: string;
    sale_timestamp: string;
    refunded: string;
    disputed: string;
    license_key?: string;
    // Custom fields passed via checkout URL query params
    url_params?: {
        github_username?: string;
        [key: string]: string | undefined;
    };
}
