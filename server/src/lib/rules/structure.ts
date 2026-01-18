import type { CheckResult } from '../../types/index';
import { feedbackTemplates } from '../feedback';

const ORGANIZED_FOLDERS = ['src', 'lib', 'app', 'components', 'pages', 'utils', 'hooks', 'services'];

export function checkStructure(files: string[]): CheckResult[] {
    const results: CheckResult[] = [];

    // Check: Has organized folders (+15)
    const hasOrganizedFolders = ORGANIZED_FOLDERS.some((folder) =>
        files.some((file) => file.startsWith(folder + '/') || file === folder)
    );
    results.push({
        checkName: 'Organized folder structure',
        category: 'structure',
        passed: hasOrganizedFolders,
        points: hasOrganizedFolders ? 15 : 0,
        maxPoints: 15,
        message: hasOrganizedFolders ? feedbackTemplates.hasOrganizedFolders.message : feedbackTemplates.noOrganizedFolders.message,
        suggestion: hasOrganizedFolders ? undefined : feedbackTemplates.noOrganizedFolders.suggestion,
    });

    // Check: Clean root (no more than 15 loose files) (+5)
    const rootFiles = files.filter((file) => !file.includes('/'));
    const hasCleanRoot = rootFiles.length <= 15;
    results.push({
        checkName: 'Clean root directory',
        category: 'structure',
        passed: hasCleanRoot,
        points: hasCleanRoot ? 5 : 0,
        maxPoints: 5,
        message: hasCleanRoot ? feedbackTemplates.cleanRoot.message : feedbackTemplates.messyRoot.message,
        suggestion: hasCleanRoot ? undefined : feedbackTemplates.messyRoot.suggestion,
    });

    return results;
}
