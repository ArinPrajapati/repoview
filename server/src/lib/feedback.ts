export const feedbackTemplates = {
    // README
    noReadme: {
        message: 'No README.md file found',
        suggestion: 'Add a README.md file to describe your project, installation steps, and usage examples.',
    },
    shortReadme: {
        message: 'README is too short (< 300 characters)',
        suggestion: 'Expand your README with project overview, installation instructions, and usage examples.',
    },
    readmeExists: {
        message: 'README.md file exists',
    },
    readmeLongEnough: {
        message: 'README has sufficient content',
    },
    noDescription: {
        message: 'README lacks a clear project description',
        suggestion: 'Add a brief description at the top of your README explaining what your project does.',
    },
    hasDescription: {
        message: 'README includes project description',
    },
    noInstallation: {
        message: 'README lacks installation instructions',
        suggestion: 'Add installation steps so users know how to set up your project.',
    },
    hasInstallation: {
        message: 'README includes installation instructions',
    },
    noUsage: {
        message: 'README lacks usage instructions',
        suggestion: 'Add usage examples showing how to run or use your project.',
    },
    hasUsage: {
        message: 'README includes usage instructions',
    },

    // Commits
    noCommits: {
        message: 'No commits found',
        suggestion: 'Commit your code to show project history and development progress.',
    },
    hasCommits: {
        message: 'Repository has commit history',
    },
    fewCommits: {
        message: 'Only a few commits (≤5)',
        suggestion: 'Continue developing and committing to show ongoing progress.',
    },
    manyCommits: {
        message: 'Good commit history (>5 commits)',
    },
    staleRepo: {
        message: 'No commits in the last 30 days',
        suggestion: 'Consider updating or maintaining your project to show it is active.',
    },
    recentActivity: {
        message: 'Recent commit activity (within 30 days)',
    },

    // Structure
    noOrganizedFolders: {
        message: 'No organized folder structure',
        suggestion: 'Organize your code into folders like /src, /lib, /components, or /app.',
    },
    hasOrganizedFolders: {
        message: 'Well-organized folder structure',
    },
    messyRoot: {
        message: 'Too many files in root directory (>15)',
        suggestion: 'Move files into organized subdirectories to improve project clarity.',
    },
    cleanRoot: {
        message: 'Clean root directory',
    },

    // Testing
    noTests: {
        message: 'No test files detected',
        suggestion: 'Add unit tests using Jest, Vitest, PyTest, or your framework testing tools.',
    },
    hasTests: {
        message: 'Test files found',
    },

    // Deployment
    noDeployment: {
        message: 'No live deployment link found',
        suggestion: 'Deploy your project on Vercel, Netlify, Render, or GitHub Pages and add the link to README.',
    },
    hasDeployment: {
        message: 'Live deployment link found',
    },

    // Good Practices
    noLicense: {
        message: 'No LICENSE file found',
        suggestion: 'Add an MIT or Apache 2.0 license to clarify usage rights.',
    },
    hasLicense: {
        message: 'LICENSE file exists',
    },
    noGitignore: {
        message: 'No .gitignore file found',
        suggestion: 'Add a .gitignore file to exclude node_modules, build artifacts, and sensitive files.',
    },
    hasGitignore: {
        message: '.gitignore file exists',
    },
};
