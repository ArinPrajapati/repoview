# Telemetry (Plan A: Primary Sink = Server JSON Logs)

This project currently uses **self-hosted telemetry**:

- Frontend emits events (page views, button clicks, API failures)
- Backend exposes `POST /api/telemetry`
- Backend writes events to **structured JSON-lines logs** (stdout/stderr)

The **primary sink** is the server logs. You can ship those logs to any log platform (ELK, Loki, Datadog, CloudWatch, etc.) or tail them locally.

---

## What “primary sink” means

- We do **not** store telemetry in a database right now.
- We do **not** send events to Discord right now.
- We do **not** run a queue/stream pipeline right now.

Everything ends up as **one JSON object per line** emitted by the API server.

---

## Endpoints

### `POST /api/telemetry`

Accepts either:

- `{ "events": TelemetryEvent[] }`
- `TelemetryEvent[]`
- or a single `TelemetryEvent`

Hard limits:

- Max 50 events per request (to avoid huge payloads)

---

## Frontend events

The frontend sends events to the server collector using [frontend/src/lib/analytics.ts](frontend/src/lib/analytics.ts).

### Event schema

Fields are intentionally flexible, but the core looks like:

- `timestamp` (ISO string)
- `event` (string)
- `anonymousId` (string, persisted in `localStorage`)
- `userId` (optional; GitHub username when available)
- `page` (optional; current URL)
- `element` (optional; UI element label)
- `action` (optional; e.g. click)
- `requestId` (optional; client-side request ID for correlation)
- `properties` (optional object; any extra properties)

### Events currently emitted

- `page_view` (route changes)
- `button_click` (from the shared Button component)
- `api_fail` (any fetch failure / non-2xx from API calls)

---

## Server logging (JSON-lines)

The server logger writes one line per log entry.

### Common log fields

- `timestamp`
- `level` (`info|warn|error|debug`)
- `service` (default `repoview-api`)
- `env` (from `NODE_ENV`)
- `requestId` (server request id; response header `X-Request-Id`)
- `userId` (best-effort extracted from request)
- `route` (method + URL)
- `durationMs` (for request logs)
- `function` (logical handler name for route logs)
- `params` / `properties` (structured details)
- `error` (for error logs, normalized to `{name,message,stack}`)

### Example telemetry log line

```json
{"timestamp":"2026-01-24T12:00:00.000Z","service":"repoview-api","env":"development","level":"info","message":"telemetry_event","type":"telemetry","requestId":"<server-req-id>","clientRequestId":"<client-req-id>","userId":"octocat","event":"button_click","page":"/results?user=octocat&repos=a,b","properties":{"label":"Download Report","variant":"default","size":"lg"}}
```

### Where logs go

- By default: **stdout** (and stderr for `error`)
- In Docker/Kubernetes: logs are collected from container stdout

---

## Correlation strategy

We use **two IDs**:

- `requestId` (server): generated/propagated by the API server, returned as `X-Request-Id`
- `clientRequestId` (client): generated in frontend for each API call; included in telemetry payload `requestId`

For `api_fail`, the event includes the client request ID so you can match the failing request with server logs.

---

## Safety / privacy

- Do not log secrets (tokens, passwords).
- Email is redacted in webhook logs.
- Telemetry is intended to be **low-risk behavioral events**.

If you decide to forward events to Discord later, avoid including PII.

---

## Next upgrades (optional)

- Forward telemetry to Discord via a worker that tails logs or forwards from `/api/telemetry`
- Add sampling/rate-limits per `anonymousId`
- Store in a proper events DB (ClickHouse/BigQuery/Postgres)
- Add trace propagation (W3C `traceparent`) if you need distributed tracing
