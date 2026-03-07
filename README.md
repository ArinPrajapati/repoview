# RepoView 📊

A transparent, rule-based GitHub repository analyzer that helps developers evaluate their project quality without AI-generated feedback. Get objective scores, clear strengths/weaknesses, and actionable improvement suggestions for your GitHub repositories.

## ✨ Features

- **Objective Scoring**: Deterministic, explainable scoring system (0-100 points)
- **Rule-Based Analysis**: No AI - every score is traceable to a specific rule
- **Comprehensive Checks**:
  - README quality (existence, length, content)
  - Commit history (frequency, recency)
  - Project structure (organized folders)
  - Testing presence (test files, test folders)
  - Deployment status (live deployment links)
  - Best practices (LICENSE, .gitignore)
- **Actionable Feedback**: Clear, practical suggestions for improvement
- **PDF Export**: Generate professional reports for sharing with recruiters or mentors (paid feature)
- **Fast Analysis**: Results in under 5 seconds for typical users

## 🎯 Use Cases

- **Job Seekers**: Evaluate and improve your GitHub portfolio before interviews
- **Students**: Assess class projects and identify areas for improvement
- **Developers**: Review open-source contributions and personal projects
- **Mentors**: Provide structured feedback to mentees

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- GitHub Personal Access Token (PAT)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/ArinPrajapati/repoview.git
cd repoview
```

2. **Set up environment variables**:
```bash
cp env.docker.example .env
# Edit .env with your values
```

Required environment variables:
```
GITHUB_TOKEN=your_github_pat_here
DATABASE_URL=postgresql://user:password@localhost:5432/repoview
PORT=3001
```

3. **Start with Docker (recommended)**:
```bash
docker-compose up -d
```

4. **Or start manually**:

**Backend**:
```bash
cd server
npm install
npm run db:generate
npm run db:push
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

5. **Access the application**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📖 Usage

1. Open the web application
2. Enter your GitHub username
3. Select repositories to analyze
4. View scores, strengths, weaknesses, and suggestions
5. Export PDF report (paid feature)

## 🧪 How It Works

### Scoring System

Each repository is evaluated against specific rules:

| Category | Maximum Points | Checks |
|----------|---------------|--------|
| README | 40 | Existence, length, description, installation, usage |
| Commits | 30 | Commit count, recent activity |
| Structure | 20 | Organized folders, no file dumping |
| Testing | 15 | Test files/folders present |
| Deployment | 20 | Live deployment link |
| Best Practices | 10 | LICENSE, .gitignore |

**Total**: 135 points (normalized to 100)

**Score Interpretation**:
- 80-100: Strong project
- 60-79: Decent but improvable
- 40-59: Weak, needs work
- Below 40: Poor quality

### Rule-Based Analysis

The analysis is fully deterministic:

- **README Check**: Scans for README.md/rst, measures length, checks for key sections
- **Commit Analysis**: Uses GitHub API to fetch commit history and calculate metrics
- **Structure Analysis**: Examines folder organization (src/, lib/, app/, tests/)
- **Testing Detection**: Searches for .test., .spec. files and test directories
- **Deployment Detection**: Parses README for deployment platform links
- **Practice Check**: Verifies LICENSE and .gitignore files

## 🏗️ Architecture

### Tech Stack

**Frontend**:
- React 19
- Vite
- TypeScript
- Tailwind CSS
- Radix UI (shadcn/ui components)
- React Router

**Backend**:
- Node.js
- Express
- TypeScript
- PostgreSQL
- Drizzle ORM
- Octokit (GitHub API)

**Deployment**:
- Docker & Docker Compose
- PDF generation with jsPDF

### Project Structure

```
repoview/
├── frontend/          # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── server/           # Express backend
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/  # Business logic
│   │   └── db/       # Database schema
│   ├── package.json
│   └── drizzle.config.ts
├── docs/            # Additional documentation
│   ├── API_TEST.md
│   ├── DATA_MODEL.md
│   └── DEPLOYMENT.md
├── docker-compose.yml
└── plan.md          # Detailed project plan
```

## 💰 Pricing

**Free Version**:
- Analyze up to 3 repositories
- Full detailed feedback
- No PDF export

**Paid Version ($5 one-time)**:
- Unlimited repository analysis
- Full detailed feedback
- PDF export enabled

## 🛠️ Development

### Database Operations

```bash
# Generate migrations
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate
```

### API Endpoints

- `GET /ping` - Health check
- `POST /api/analyze` - Analyze repositories
- `GET /api/repositories/:username` - Fetch user's repositories
- `POST /api/report/pdf` - Generate PDF report

See `docs/API_TEST.md` for detailed API documentation.

## 📝 Non-AI Philosophy

RepoView intentionally avoids AI-generated analysis to provide:

- **Transparency**: Every score is explainable
- **Consistency**: Same input always yields same output
- **Actionability**: Feedback is practical and implementable
- **Trust**: Users understand how scores are calculated

## 🚧 Roadmap

### v1.0 (Current)
- [x] Basic repository analysis
- [x] Scoring system
- [x] Web interface
- [x] PDF export
- [x] Deployment

### Future Enhancements
- [ ] User accounts and authentication
- [ ] GitHub login integration
- [ ] Team/organization analysis
- [ ] Historical score tracking
- [ ] Integration badges for READMEs

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built for developers who want transparent feedback
- Inspired by the need for objective project quality assessment
- Using GitHub's extensive API for repository data

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Note**: RepoView does not use AI for analysis. All scoring is rule-based and deterministic.
