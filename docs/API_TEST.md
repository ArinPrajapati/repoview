# RepoView API - Test Curls

Base URL: `http://localhost:3001`

## Health Check

```bash
curl http://localhost:3001/health
```

---

## Get Repositories

```bash
# Fetch public repos for a GitHub user
curl "http://localhost:3001/api/repos?username=torvalds"
```

---

## Analyze Repositories

```bash
# Analyze repos (free tier - max 3)
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "torvalds",
    "repos": ["linux"]
  }'
```

---

## Check Premium Status

```bash
# Check if GitHub user has premium
curl "http://localhost:3001/api/user?username=someuser"
```

---

## Generate PDF

```bash
# Generate PDF report (requires analysis data)
curl -X POST http://localhost:3001/api/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "username": "torvalds",
    "analyses": [
      {
        "repoName": "linux",
        "repoUrl": "https://github.com/torvalds/linux",
        "totalScore": 95,
        "maxScore": 130,
        "percentage": 73,
        "tier": "decent",
        "checks": [],
        "strengths": ["Good README", "Active commits"],
        "weaknesses": ["No tests"],
        "suggestions": ["Add unit tests"]
      }
    ]
  }' \
  --output report.pdf
```

---

## Webhook (Gumroad Ping Simulation)

```bash
# Simulate Gumroad purchase webhook
curl -X POST http://localhost:3001/api/webhook/gumroad \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "seller_id=YOUR_SELLER_ID" \
  -d "product_id=abc123" \
  -d "email=buyer@example.com" \
  -d "price=500" \
  -d "sale_id=sale_123" \
  -d "sale_timestamp=2026-01-18T10:00:00Z" \
  -d "refunded=false" \
  -d "disputed=false" \
  -d "url_params[github_username]=someuser"
```

---

## Full Flow Test

```bash
# 1. Check user (should be false)
curl "http://localhost:3001/api/user?username=testuser"

# 2. Analyze 1 repo
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"owner": "testuser", "repos": ["repo1"]}'

# 3. Simulate purchase
curl -X POST http://localhost:3001/api/webhook/gumroad \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "seller_id=test" \
  -d "email=test@example.com" \
  -d "sale_timestamp=2026-01-18T10:00:00Z" \
  -d "refunded=false" \
  -d "disputed=false" \
  -d "url_params[github_username]=testuser"

# 4. Check user (should be true now)
curl "http://localhost:3001/api/user?username=testuser"
```
