import type { CheckResult } from '../../types/index';
import { feedbackTemplates } from '../feedback';

export function checkPractices(files: string[]): CheckResult[] {
    const results: CheckResult[] = [];
    const fileNames = files.map((f) => f.toLowerCase());

    // Check: LICENSE exists (+5)
    const hasLicense = fileNames.some((f) => f === 'license' || f === 'license.md' || f === 'license.txt');
    results.push({
        checkName: 'LICENSE file',
        category: 'practices',
        passed: hasLicense,
        points: hasLicense ? 5 : 0,
        maxPoints: 5,
        message: hasLicense ? feedbackTemplates.hasLicense.message : feedbackTemplates.noLicense.message,
        suggestion: hasLicense ? undefined : feedbackTemplates.noLicense.suggestion,
    });

    // Check: .gitignore exists (+5)
    const hasGitignore = fileNames.includes('.gitignore');
    results.push({
        checkName: '.gitignore file',
        category: 'practices',
        passed: hasGitignore,
        points: hasGitignore ? 5 : 0,
        maxPoints: 5,
        message: hasGitignore ? feedbackTemplates.hasGitignore.message : feedbackTemplates.noGitignore.message,
        suggestion: hasGitignore ? undefined : feedbackTemplates.noGitignore.suggestion,
    });

    const hasEnv = fileNames.includes('.env');
    const hasEnvProduction = fileNames.some((f) => f === '.env.production' || f === '.env.prod');
    const hasEnvLocal = fileNames.includes('.env.local');

    if (hasEnv) {
        results.push({
            checkName: 'Exposed .env file',
            category: 'practices',
            passed: false,
            points: -10,
            maxPoints: 0,
            message: '⚠️ SECURITY RISK: .env file is committed to repository',
            suggestion: 'Remove .env from git, add it to .gitignore, and rotate any exposed secrets immediately.',
        });
    }

    if (hasEnvProduction) {
        results.push({
            checkName: 'Exposed .env.production file',
            category: 'practices',
            passed: false,
            points: -10,
            maxPoints: 0,
            message: '⚠️ SECURITY RISK: .env.production file is committed to repository',
            suggestion: 'Remove .env.production from git, add it to .gitignore, and rotate any exposed production secrets.',
        });
    }

    if (hasEnvLocal) {
        results.push({
            checkName: 'Exposed .env.local file',
            category: 'practices',
            passed: false,
            points: -5,
            maxPoints: 0,
            message: '⚠️ WARNING: .env.local file is committed to repository',
            suggestion: 'Remove .env.local from git and add it to .gitignore.',
        });
    }

    return results;
}
