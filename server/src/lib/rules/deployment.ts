import type { CheckResult } from '../../types/index';
import { feedbackTemplates } from '../feedback';

// Known deployment platforms (gives higher confidence)
const DEPLOYMENT_PLATFORMS = [
    'vercel.app', 'netlify.app', 'netlify.com', 'render.com', 'onrender.com',
    'fly.io', 'fly.dev', 'herokuapp.com', 'github.io', 'pages.dev',
    'railway.app', 'surge.sh', 'cloudflare.com', 'aws.amazon.com',
    'digitalocean.app', 'azurewebsites.net', 'firebaseapp.com',
];

// URLs to ignore (not deployments)
const IGNORE_PATTERNS = [
    'github.com', 'npmjs.com', 'npm.im', 'docs.', 'documentation',
    'twitter.com', 'linkedin.com', 'discord.gg', 'shields.io',
    'badge', 'img.shields', 'githubusercontent.com',
];

// Keywords that suggest a demo/live link
const DEMO_KEYWORDS = [
    'demo', 'live', 'website', 'deployed', 'try it', 'view it',
    'check it out', 'hosted', 'production', 'app', 'site',
];

export function checkDeployment(readme: string | null): CheckResult[] {
    const results: CheckResult[] = [];

    let hasDeployment = false;

    if (readme) {
        const readmeLower = readme.toLowerCase();

        // Method 1: Check for known deployment platforms
        const hasPlatformLink = DEPLOYMENT_PLATFORMS.some((p) => readmeLower.includes(p));

        // Method 2: Look for markdown links with demo keywords
        // Matches: [Demo](https://...) or [Live Site](https://...)
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi;
        let match;
        while ((match = linkRegex.exec(readme)) !== null) {
            const linkText = match[1].toLowerCase();
            const url = match[2].toLowerCase();

            // Skip ignored URLs
            if (IGNORE_PATTERNS.some((p) => url.includes(p))) continue;

            // Check if link text contains demo keywords
            if (DEMO_KEYWORDS.some((k) => linkText.includes(k))) {
                hasDeployment = true;
                break;
            }
        }

        // Method 3: Check for ## Demo or ## Live sections with URLs
        const demoSectionRegex = /##\s*(demo|live|website|deployed|try it)[^\n]*\n[^#]*https?:\/\//i;
        const hasDemoSection = demoSectionRegex.test(readme);

        hasDeployment = hasPlatformLink || hasDeployment || hasDemoSection;
    }

    results.push({
        checkName: 'Live deployment link',
        category: 'deployment',
        passed: hasDeployment,
        points: hasDeployment ? 20 : 0,
        maxPoints: 20,
        message: hasDeployment ? feedbackTemplates.hasDeployment.message : feedbackTemplates.noDeployment.message,
        suggestion: hasDeployment ? undefined : feedbackTemplates.noDeployment.suggestion,
    });

    return results;
}
