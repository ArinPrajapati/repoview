## RepoView
The purpose of this product is to help developers, students, and job seekers evaluate the quality of their GitHub projects using transparent, rule-based checks instead of AI-generated feedback.

## Features

- Objective scoring
- Clear strengths and weaknesses
- Actionable improvement suggestions
- A professional report (PDF) for sharing or self-review

## The product must follow these principles:

- No AI-generated analysis
- Fully deterministic and explainable logic
- Every score must be traceable to a rule
- Feedback must be practical and actionable
- Simple, fast, and focused on usefulness

## User Flow (High-Level)

- User opens the web app
- User enters their GitHub username
- System fetches public repositories
- User selects repositories to analyze
- System runs rule-based checks
- User sees:
    - Score per repo
    - Strengths
    - Weaknesses
    - Suggestions
- User can export the report as a PDF (paid feature)

## Core logic 

### Repository Checks (Rules Engine)

- Each repository will be evaluated using the following checks.

#### README Checks

- README.md exists → +15 points
- README length > 300 characters → +10 points
- README includes:
    - Project description → +5
    - Installation steps → +5
    - Usage instructions → +5

#### Commit History Checks

- At least 1 commit → +10 points
- More than 5 commits → +10 points
- Last commit within 30 days → +10 points

#### Project Structure Checks

- Presence of organized folders like:
    - /src
    - /lib
    - /app
    → +15 points
- No obvious dump of files in root → +5 points

#### Testing Checks

- Presence of:
    - /tests folder
    - or files containing .test. or .spec.
    → +15 points

#### Deployment Checks

- README contains deployment link (vercel, netlify, render, fly.io, etc.)
    → +20 points

#### Good Practices Checks

- LICENSE file exists → +5 points
- .gitignore exists → +5 points


#### Scoring System

- Maximum score: 100 points
- Score interpretation:
    - 80–100 → Strong project
    - 60–79 → Decent but improvable
    - 40–59 → Weak, needs work
    - Below 40 → Poor quality
- Each score must show:
    - Which checks passed
    - Which checks failed
    - How to improve


#### Feedback Generation (Non-AI)

- Feedback is generated using predefined templates.
- Example logic:
    - If no tests found:
        - “No test files were detected. Consider adding unit tests using Jest or PyTest to improve code reliability.”
    - If no deployment link:
        - “No live deployment link found. Deploying this project on platforms like Vercel or Render will improve credibility.”
    - If README too short:
        - “Your README is very short. Consider adding installation steps, usage examples, and project overview.”

- This ensures:
    - Consistent
    - Explainable
    - Honest feedback

#### Report Output (UI)

For each repository, user sees:
- Repository name
- Final score (e.g., 72/100)
- Strengths:
    - “Has a structured folder layout”
    - “README exists”
- Weaknesses:
    - “No tests found”
    - “No deployment link”
- Suggestions:
    - “Add Jest tests for core logic”
    - “Deploy on Vercel and add link to README”

#### PDF Export Feature

The exported PDF should include:
- User GitHub username
- Date of report generation
- Each analyzed repository
- Score per repository
- Strengths and weaknesses
- Suggestions
- Overall summary

PDF should be:
- Clean
- Professional

Suitable for sharing with mentors or recruiters


#### Free vs Paid Feature Split

Free Version:
- Analyze up to 3 repositories
- See scores and Full Detailed feedback
- No PDF export

Paid Version ($5 one-time):
- Analyze unlimited repositories
- Full detailed feedback
- PDF export enabled

#### Non-Functional Requirements

- Fast analysis (under 5 seconds for typical users)
- Simple UI (no complex dashboard required)
- Mobile-friendly layout
- No login required for MVP
- Must clearly state “No AI used” in branding


#### Success Criteria for v1

The project is considered successful if:

- The app is deployed publicly
- At least 10 users try it
- At least 1 user gives positive feedback
- You can confidently use it to improve your own GitHub

## Monetization success:
- First $1 earned = milestone achieved


#### Explicit Non-Goals (to avoid scope creep)

The MVP will NOT include:

- User accounts
- Authentication
- AI-generated feedback
- Complex dashboards
- Social features
- Mobile app
- Chrome extension
- GitHub login integration



## Tech Stack Recommendations

## Frontend:

- React
- Tailwind CSS
- Shadcn UI components
- PDF generation: jsPDF or html2pdf.js

## Backend:

- Node.js API routes
- GitHub API integration Using (octokit)
