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

// Keywords indicating CLI tool, library, or non-web project
const NON_WEB_INDICATORS = [
    'cli', 'command-line', 'command line', 'terminal', 'npm install',
    'go install', 'cargo install', 'pip install', 'brew install',
    'library', 'package', 'module', 'sdk', 'api client',
    'utility', 'tool', 'script', 'daemon', 'service',
];

// File patterns that suggest non-web project
const NON_WEB_FILES = [
    'setup.py', 'pyproject.toml', 'cargo.toml', 'go.mod',
    'makefile', 'cmake', '.gemspec',
];

/**
 * Detect if project is a CLI tool, library, or non-web app
 */
function isNonWebProject(readme: string | null, files: string[] = []): boolean {
    if (!readme) return false;
    
    const readmeLower = readme.toLowerCase();
    
    // Check for CLI/library indicators in README
    const hasNonWebKeyword = NON_WEB_INDICATORS.some(k => readmeLower.includes(k));
    
    // Check for installation commands (strong indicator of CLI/library)
    const hasInstallCmd = /```[\s\S]*?(npm install|yarn add|pip install|go get|cargo add|brew install)[\s\S]*?```/i.test(readme);
    
    // Check for "Usage" section with code blocks (common in libraries)
    const hasUsageSection = /##\s*usage[\s\S]*?```/i.test(readme);
    
    // Check for bin/main entry patterns
    const hasBinPattern = /"bin":/i.test(readme) || /entry\s*point/i.test(readme);
    
    return hasNonWebKeyword || hasInstallCmd || (hasUsageSection && !readmeLower.includes('deploy'));
}

export function checkDeployment(readme: string | null, files: string[] = []): CheckResult[] {
    const results: CheckResult[] = [];

    // First, check if this is a non-web project
    if (isNonWebProject(readme, files)) {
        results.push({
            checkName: 'Live deployment link',
            category: 'deployment',
            passed: true, // Don't penalize
            points: 20,   // Give full points
            maxPoints: 20,
            message: 'Deployment not required for this project type (library/CLI/package)',
            suggestion: undefined,
        });
        return results;
    }

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

