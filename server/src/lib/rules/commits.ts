import type { CheckResult } from '../../types/index';
import { feedbackTemplates } from '../feedback';

export function checkCommits(commits: { sha: string; date: string }[]): CheckResult[] {
    const results: CheckResult[] = [];

    // Check: At least 1 commit (+10)
    const hasCommits = commits.length >= 1;
    results.push({
        checkName: 'Has commits',
        category: 'commits',
        passed: hasCommits,
        points: hasCommits ? 10 : 0,
        maxPoints: 10,
        message: hasCommits ? feedbackTemplates.hasCommits.message : feedbackTemplates.noCommits.message,
        suggestion: hasCommits ? undefined : feedbackTemplates.noCommits.suggestion,
    });

    // Check: More than 5 commits (+10)
    const hasManyCommits = commits.length > 5;
    results.push({
        checkName: 'Good commit history',
        category: 'commits',
        passed: hasManyCommits,
        points: hasManyCommits ? 10 : 0,
        maxPoints: 10,
        message: hasManyCommits ? feedbackTemplates.manyCommits.message : feedbackTemplates.fewCommits.message,
        suggestion: hasManyCommits ? undefined : feedbackTemplates.fewCommits.suggestion,
    });

    // Check: Recent activity (within 30 days) (+10)
    let hasRecentActivity = false;
    if (commits.length > 0) {
        const lastCommitDate = new Date(commits[0].date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        hasRecentActivity = lastCommitDate > thirtyDaysAgo;
    }
    results.push({
        checkName: 'Recent activity',
        category: 'commits',
        passed: hasRecentActivity,
        points: hasRecentActivity ? 10 : 0,
        maxPoints: 10,
        message: hasRecentActivity ? feedbackTemplates.recentActivity.message : feedbackTemplates.staleRepo.message,
        suggestion: hasRecentActivity ? undefined : feedbackTemplates.staleRepo.suggestion,
    });

    return results;
}
