import type { CheckResult } from '../types/index';

export function getTier(percentage: number): 'strong' | 'decent' | 'weak' | 'poor' {
    if (percentage >= 80) return 'strong';
    if (percentage >= 60) return 'decent';
    if (percentage >= 40) return 'weak';
    return 'poor';
}

export function calculateScore(checks: CheckResult[]): {
    totalScore: number;
    maxScore: number;
    percentage: number;
    tier: 'strong' | 'decent' | 'weak' | 'poor';
} {
    const totalScore = checks.reduce((sum, check) => sum + check.points, 0);
    const maxScore = checks.reduce((sum, check) => sum + check.maxPoints, 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const tier = getTier(percentage);

    return { totalScore, maxScore, percentage, tier };
}
