import type { AnalysisResult, CheckResult } from '../../types/index';
import { fetchReadme, fetchRepoContents, fetchCommits } from '../github';
import { calculateScore } from '../scoring';
import { checkReadme } from './readme';
import { checkCommits } from './commits';
import { checkStructure } from './structure';
import { checkTesting } from './testing';
import { checkDeployment } from './deployment';
import { checkPractices } from './practices';

export async function analyzeRepository(owner: string, repoName: string): Promise<AnalysisResult> {
    // Fetch all data in parallel
    const [readme, files, commits] = await Promise.all([
        fetchReadme(owner, repoName),
        fetchRepoContents(owner, repoName),
        fetchCommits(owner, repoName),
    ]);

    // Run all checks
    const allChecks: CheckResult[] = [
        ...checkReadme(readme),
        ...checkCommits(commits),
        ...checkStructure(files),
        ...checkTesting(files),
        ...checkDeployment(readme),
        ...checkPractices(files),
    ];

    // Calculate score
    const { totalScore, maxScore, percentage, tier } = calculateScore(allChecks);

    // Extract strengths, weaknesses, suggestions
    const strengths = allChecks
        .filter((check) => check.passed)
        .map((check) => check.message);

    const weaknesses = allChecks
        .filter((check) => !check.passed)
        .map((check) => check.message);

    const suggestions = allChecks
        .filter((check) => !check.passed && check.suggestion)
        .map((check) => check.suggestion!);

    return {
        repoName,
        repoUrl: `https://github.com/${owner}/${repoName}`,
        totalScore,
        maxScore,
        percentage,
        tier,
        checks: allChecks,
        strengths,
        weaknesses,
        suggestions,
    };
}
