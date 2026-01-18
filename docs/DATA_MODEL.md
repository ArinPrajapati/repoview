# RepoView Data Model

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                          users                              │
├─────────────────────────────────────────────────────────────┤
│ github_username  │ TEXT      │ PRIMARY KEY                  │
│ email            │ TEXT      │ NOT NULL                     │
│ is_premium       │ BOOLEAN   │ DEFAULT false, NOT NULL      │
│ purchase_date    │ TIMESTAMP │ NULLABLE                     │
│ created_at       │ TIMESTAMP │ DEFAULT now(), NOT NULL      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (github_username)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      analysis_usage                         │
├─────────────────────────────────────────────────────────────┤
│ github_username  │ TEXT      │ PRIMARY KEY                  │
│ repos_analyzed   │ INTEGER   │ DEFAULT 0, NOT NULL          │
│ last_analyzed_at │ TIMESTAMP │ DEFAULT now(), NOT NULL      │
└─────────────────────────────────────────────────────────────┘
```

## Entity Relationships

```
users (1) ─────────────────────────── (1) analysis_usage
       └── github_username (FK) ─────────┘
```

## Business Logic

### Free Tier

- **Limit**: 3 repos per GitHub account
- **Tracking**: `analysis_usage.repos_analyzed`
- Returns 403 when limit reached

### Premium Tier

- **Unlimited** repos
- Purchased via Gumroad
- Linked by `github_username` (passed via `?github_username=` in checkout URL)

## API Flow

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐
│  Client  │────▶│  /api/repos │────▶│  GitHub API  │
└──────────┘     └─────────────┘     └──────────────┘
     │
     │  POST /api/analyze
     │  { owner, repos[] }
     ▼
┌─────────────────────────────────────────────────────┐
│                    Analyze Route                    │
├─────────────────────────────────────────────────────┤
│ 1. Lookup users.is_premium by github_username       │
│ 2. Lookup analysis_usage.repos_analyzed             │
│ 3. If !premium && repos_analyzed >= 3 → 403         │
│ 4. Run rules engine on each repo                    │
│ 5. Update repos_analyzed count                      │
│ 6. Return analyses + usage info                     │
└─────────────────────────────────────────────────────┘

┌──────────┐     ┌────────────────────┐     ┌──────────┐
│ Gumroad  │────▶│ /api/webhook/gumroad │────▶│    DB    │
│ Purchase │     │ (url_params.github_  │     │  users   │
└──────────┘     │  username)           │     └──────────┘
                 └────────────────────┘
```

## Scoring Points

| Category   | Check             | Points  |
| ---------- | ----------------- | ------- |
| README     | Exists            | +15     |
| README     | > 300 chars       | +10     |
| README     | Description       | +5      |
| README     | Installation      | +5      |
| README     | Usage             | +5      |
| Commits    | At least 1        | +10     |
| Commits    | More than 5       | +10     |
| Commits    | Recent (30 days)  | +10     |
| Structure  | Organized folders | +15     |
| Structure  | Clean root        | +5      |
| Testing    | Tests exist       | +15     |
| Deployment | Live link         | +20     |
| Practices  | LICENSE           | +5      |
| Practices  | .gitignore        | +5      |
| **TOTAL**  |                   | **130** |

### Penalties (Security)

| Issue           | Points |
| --------------- | ------ |
| .env exposed    | -10    |
| .env.production | -10    |
| .env.local      | -5     |
