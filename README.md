# HackScrap - Hackathon Scraper

A Node.js + Express + MongoDB scraper that aggregates hackathons from multiple sources and serves them via simple endpoints.

## Prerequisites
- Node.js 18+ (uses ES modules)
- MongoDB instance (Atlas or self-hosted)

## Environment
Create a `.env` file with:
```
MONGO_DB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
PORT=8000
```

## Run locally
```
npm ci
npm start
```
App runs on `http://localhost:8000`.

Endpoints:
- `/` serves `index.html`
- `/hackathons` returns JSON list
- `/testdb` creates and reads a dummy record

## Scheduled scraping
The scraper runs on start and then every 6 hours via cron. It writes to MongoDB and de-duplicates by title and link.

## Docker
Build:
```
docker build -t hackscrap .
```
Run:
```
docker run -p 8000:8000 \
  -e PORT=8000 \
  -e MONGO_DB_URI="<your mongo uri>" \
  hackscrap
```

## Deploy options
- Render/Railway/Fly.io: Use the Docker image or build from repo. Set env vars `MONGO_DB_URI` and `PORT`. Healthcheck can hit `/hackathons`.
- Vercel (serverless) note: This app maintains a long-running server and uses Puppeteer + cron. Prefer a containerized deployment (Vercel Functions are not suitable for cron and headless Chrome). If using Vercel, deploy as a Docker container.

## Dev
- Hot reload: `npm run dev`
- BrowserSync proxy (optional): `npm run browsersync`