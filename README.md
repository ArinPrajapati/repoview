# RepoView 📊

**Transparent, rule-based GitHub repository quality analyzer**

RepoView helps developers, students, and job seekers evaluate the quality of their GitHub projects using objective, rule-based checks instead of AI-generated feedback. Get actionable insights to improve your projects and impress recruiters.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19.2-cyan)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/license-MIT-purple)

---

## ✨ Features

### 🎯 Objective Scoring
- **Rule-based analysis** - Every score is traceable to a specific check
- **Transparent feedback** - See exactly which checks passed/failed
- **Actionable suggestions** - Practical steps to improve your projects

### 📈 Comprehensive Checks
- **README quality** - Existence, length, and content sections
- **Commit activity** - Commit count and recency
- **Project structure** - Folder organization and cleanliness
- **Testing** - Test file presence and coverage indicators
- **Deployment** - Live deployment links in README
- **Best practices** - LICENSE, .gitignore, and security checks

### 💰 Freemium Model
- **Free tier** - Analyze up to 3 repositories with full detailed feedback
- **Premium ($5 one-time)** - Unlimited analysis + PDF export for sharing with mentors/recruiters

### 🚀 Key Differentiators
- **No AI analysis** - Fully deterministic and explainable logic
- **Fast** - Under 5 seconds for typical analyses
- **No login required** - Just enter your GitHub username
- **Mobile-friendly** - Works on all devices

---

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │─────▶│ Express API  │─────▶│  PostgreSQL │
│  Frontend   │      │  (Node.js)   │      │   Database  │
└─────────────┘      └──────────────┘      └─────────────┘
       │                      │                       │
       │                      ▼                       │
       │              ┌──────────────┐               │
       └─────────────▶│ GitHub API   │◀──────────────┘
                      │  (Octokit)   │
                      └──────────────┘
```

### Tech Stack

**Frontend**
- React 19.2 + TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Shadcn UI components
- React Router for navigation

**Backend**
- Express.js 5 + TypeScript
- Drizzle ORM for database operations
- Octokit for GitHub API integration
- jsPDF for PDF generation

**Database**
- PostgreSQL for user data and usage tracking

---

## 📊 Scoring System

### Maximum Score: 130 points

| Category        | Check                          | Points |
| --------------- | ------------------------------ | ------ |
| **README**      | Exists                         | +15    |
|                 | > 300 characters               | +10    |
|                 | Includes description           | +5     |
|                 | Includes installation steps    | +5     |
|                 | Includes usage instructions    | +5     |
| **Commits**     | At least 1 commit              | +10    |
|                 | More than 5 commits            | +10    |
|                 | Last commit within 30 days     | +10    |
| **Structure**   | Organized folders (/src, /lib) | +15    |
|                 | Clean root (no file dump)     | +5     |
| **Testing**     | Test files exist               | +15    |
| **Deployment**  | Live deployment link           | +20    |
| **Practices**   | LICENSE file exists            | +5     |
|                 | .gitignore exists              | +5     |

### Penalties (Security)
| Issue           | Points |
| --------------- | ------ |
| .env exposed    | -10    |
| .env.production | -10    |
| .env.local      | -5     |

### Score Interpretation
- **80–100**: Strong project 🌟
- **60–79**: Decent but improvable 👍
- **40–59**: Weak, needs work ⚠️
- **Below 40**: Poor quality ❌

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- GitHub Personal Access Token (for API access)

### Installation

```bash
# Clone the repository
git clone https://github.com/ArinPrajapati/repoview.git
cd repoview

# Setup backend
cd server
npm install
cp .env.example .env
# Edit .env with your values

# Setup frontend
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your API URL
```

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/repoview
GITHUB_TOKEN=your_github_token_here
GUMROAD_SELLER_ID=your_seller_id
PORT=3001
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001
```

### Running Locally

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Deployment

### Quick Start

```bash
# Copy environment template
cp env.docker.example .env
# Edit .env with your values

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Services
- **Frontend**: Port 80 (Caddy + React SPA)
- **Backend**: Port 3001 (Express API)
- **Database**: Port 5432 (PostgreSQL)

### Production Deployment

For production deployment with HTTPS, see [DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 📚 API Endpoints

| Endpoint          | Method | Description                     | Auth |
| ----------------- | ------ | ------------------------------- | ---- |
| `/api/repos`      | GET    | Fetch user's GitHub repositories | None |
| `/api/analyze`    | POST   | Analyze selected repositories   | None |
| `/api/pdf`        | POST   | Generate PDF report             | Premium |
| `/api/user`       | GET    | Get user premium status         | None |
| `/webhook/gumroad`| POST   | Gumroad payment webhook         | - |

### Example: Analyze Repositories

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "github_username": "arinprajapati",
    "repos": ["hydragate", "repoview", "chainmail"]
  }'
```

Response:
```json
{
  "analyses": [
    {
      "repo_name": "hydragate",
      "score": 95,
      "strengths": ["Has comprehensive README", "Active development"],
      "weaknesses": ["No test files found"],
      "suggestions": ["Add unit tests using Jest"]
    }
  ],
  "usage": {
    "repos_analyzed": 1,
    "is_premium": false,
    "remaining_free": 2
  }
}
```

---

## 🎯 Usage

1. **Enter GitHub username** - The app fetches your public repositories
2. **Select repositories** - Choose which ones to analyze (up to 3 on free tier)
3. **Run analysis** - Click "Analyze" to run rule-based checks
4. **Review results** - See scores, strengths, weaknesses, and suggestions
5. **Export (Premium)** - Generate a professional PDF report for sharing

---

## 💰 Premium Features

### What You Get
- ✅ Unlimited repository analysis
- ✅ Professional PDF reports
- ✅ Share with mentors and recruiters
- ✅ One-time payment ($5)

### Purchase
Purchase premium via Gumroad. Your premium status is linked to your GitHub username.

---

## 📂 Project Structure

```
repoview/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/           # Home, Analyze, Results pages
│   │   ├── components/      # UI components
│   │   └── lib/             # API client, utilities
│   └── package.json
├── server/                   # Express backend
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── lib/
│   │   │   ├── rules/       # Scoring rules
│   │   │   ├── scoring.ts   # Score calculator
│   │   │   ├── feedback.ts  # Feedback generator
│   │   │   ├── github.ts    # GitHub API client
│   │   │   └── pdf.ts       # PDF generator
│   │   └── db/
│   │       └── schema.ts    # Database schema
│   └── package.json
├── docs/                     # Documentation
│   ├── DATA_MODEL.md        # Database schema
│   ├── DEPLOYMENT.md        # Deployment guide
│   └── API_TEST.md          # API testing
├── docker-compose.yml       # Docker setup
└── plan.md                  # Project plan
```

---

## 🔧 Development

### Backend Scripts

```bash
cd server
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
```

### Frontend Scripts

```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

---

## 🧪 Testing

See [docs/API_TEST.md](docs/API_TEST.md) for API testing examples.

---

## 📖 Documentation

- [Data Model](docs/DATA_MODEL.md) - Database schema and relationships
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment with Docker
- [API Testing](docs/API_TEST.md) - API endpoint examples and testing
- [Project Plan](plan.md) - Original project specification and requirements

---

## 🎯 Success Criteria (v1)

The project is considered successful if:

- ✅ The app is deployed publicly
- ✅ At least 10 users try it
- ✅ At least 1 user gives positive feedback
- ✅ Can confidently use it to improve own GitHub

### Monetization Milestone
- 💰 First $1 earned = milestone achieved

---

## 🚫 Non-Goals (MVP)

The MVP will NOT include:

- User accounts
- Authentication
- AI-generated feedback
- Complex dashboards
- Social features
- Mobile app
- Chrome extension
- GitHub login integration

---

## 🤝 Contributing

Contributions are welcome! This project is open to improvements in:
- Additional scoring rules
- UI/UX improvements
- Performance optimizations
- Bug fixes

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Built with ❤️ by Arin**

*Started: January 2026*
