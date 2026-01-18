import type { CheckResult } from '../../types/index';
import { feedbackTemplates } from '../feedback';

const TEST_PATTERNS = [
    'tests/',
    'test/',
    '__tests__/',
    '.test.',
    '.spec.',
    '_test.',
    '_spec.',
];

export function checkTesting(files: string[]): CheckResult[] {
    const results: CheckResult[] = [];

    // Check: Tests exist (+15)
    const hasTests = files.some((file) =>
        TEST_PATTERNS.some((pattern) => file.includes(pattern))
    );

    results.push({
        checkName: 'Has test files',
        category: 'testing',
        passed: hasTests,
        points: hasTests ? 15 : 0,
        maxPoints: 15,
        message: hasTests ? feedbackTemplates.hasTests.message : feedbackTemplates.noTests.message,
        suggestion: hasTests ? undefined : feedbackTemplates.noTests.suggestion,
    });

    return results;
}
