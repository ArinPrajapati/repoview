# RepoView Deployment Guide

This guide covers deploying RepoView using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- GitHub Personal Access Token (for API access)

## Quick Start

```bash
# Clone and navigate to project
cd /path/to/repoview

# Copy environment template
cp env.docker.example .env

# Edit .env with your values
nano .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Environment Variables

| Variable            | Required | Description                              |
| ------------------- | -------- | ---------------------------------------- |
| `POSTGRES_USER`     | No       | Database username (default: repoview)    |
| `POSTGRES_PASSWORD` | **Yes**  | Database password                        |
| `POSTGRES_DB`       | No       | Database name (default: repoview)        |
| `GITHUB_TOKEN`      | **Yes**  | GitHub API token for repo access         |
| `GUMROAD_SELLER_ID` | No       | For premium features                     |
| `VITE_API_URL`      | No       | API URL (default: http://localhost:3001) |
| `CLIENT_URL`        | No       | Frontend URL for CORS                    |

## Services

| Service  | Port    | Description             |
| -------- | ------- | ----------------------- |
| frontend | 80, 443 | Caddy serving React SPA |
| server   | 3001    | Express API             |
| postgres | 5432    | PostgreSQL database     |

## Production Deployment

### Enable HTTPS

Edit `frontend/Caddyfile` - replace `:80` with your domain:

```caddyfile
yourdomain.com {
    root * /srv
    encode gzip zstd
    try_files {path} /index.html
    file_server
}
```

Caddy automatically obtains and renews SSL certificates.

### Update Environment

```bash
# .env for production
VITE_API_URL=https://api.yourdomain.com
CLIENT_URL=https://yourdomain.com
```

## Database Management

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U repoview -d repoview

# Backup database
docker-compose exec postgres pg_dump -U repoview repoview > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U repoview -d repoview
```

## Common Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (DELETES DATA)
docker-compose down -v

# Rebuild after code changes
docker-compose build --no-cache
docker-compose up -d

# View specific service logs
docker-compose logs -f server
```

## Troubleshooting

### Database connection issues

```bash
# Check if postgres is healthy
docker-compose ps
docker-compose logs postgres
```

### Frontend not loading

```bash
# Check Caddy logs
docker-compose logs frontend

# Verify build succeeded
docker-compose exec frontend ls /srv
```

### API errors

```bash
# Check server logs
docker-compose logs server

# Verify environment variables
docker-compose exec server env | grep -E "(DATABASE|GITHUB)"
```
