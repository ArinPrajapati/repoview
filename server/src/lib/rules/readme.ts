import type { CheckResult } from '../../types/index';
import { feedbackTemplates } from '../feedback';

export function checkReadme(readme: string | null): CheckResult[] {
    const results: CheckResult[] = [];

    // Check: README exists (+15)
    const readmeExists = readme !== null;
    results.push({
        checkName: 'README exists',
        category: 'readme',
        passed: readmeExists,
        points: readmeExists ? 15 : 0,
        maxPoints: 15,
        message: readmeExists ? feedbackTemplates.readmeExists.message : feedbackTemplates.noReadme.message,
        suggestion: readmeExists ? undefined : feedbackTemplates.noReadme.suggestion,
    });

    if (!readme) return results;

    // Check: README > 300 chars (+10)
    const isLongEnough = readme.length > 300;
    results.push({
        checkName: 'README length',
        category: 'readme',
        passed: isLongEnough,
        points: isLongEnough ? 10 : 0,
        maxPoints: 10,
        message: isLongEnough ? feedbackTemplates.readmeLongEnough.message : feedbackTemplates.shortReadme.message,
        suggestion: isLongEnough ? undefined : feedbackTemplates.shortReadme.suggestion,
    });

    const readmeLower = readme.toLowerCase();

    // Check: Has description (+5)
    const hasDescription = /^#\s+\w+|## description|## about|## overview/im.test(readme) ||
        readme.split('\n').slice(0, 5).join(' ').length > 50;
    results.push({
        checkName: 'Has description',
        category: 'readme',
        passed: hasDescription,
        points: hasDescription ? 5 : 0,
        maxPoints: 5,
        message: hasDescription ? feedbackTemplates.hasDescription.message : feedbackTemplates.noDescription.message,
        suggestion: hasDescription ? undefined : feedbackTemplates.noDescription.suggestion,
    });

    // Check: Has installation (+5)
    const hasInstallation = /install|npm i|yarn add|pip install|## installation|## setup|## getting started/i.test(readmeLower);
    results.push({
        checkName: 'Has installation instructions',
        category: 'readme',
        passed: hasInstallation,
        points: hasInstallation ? 5 : 0,
        maxPoints: 5,
        message: hasInstallation ? feedbackTemplates.hasInstallation.message : feedbackTemplates.noInstallation.message,
        suggestion: hasInstallation ? undefined : feedbackTemplates.noInstallation.suggestion,
    });

    // Check: Has usage (+5)
    const hasUsage = /usage|how to use|## usage|## running|## run|example/i.test(readmeLower);
    results.push({
        checkName: 'Has usage instructions',
        category: 'readme',
        passed: hasUsage,
        points: hasUsage ? 5 : 0,
        maxPoints: 5,
        message: hasUsage ? feedbackTemplates.hasUsage.message : feedbackTemplates.noUsage.message,
        suggestion: hasUsage ? undefined : feedbackTemplates.noUsage.suggestion,
    });

    return results;
}
