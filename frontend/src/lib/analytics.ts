const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export type TelemetryEvent = {
  timestamp: string;
  event: string;
  userId?: string;
  anonymousId?: string;
  page?: string;
  element?: string;
  action?: string;
  requestId?: string;
  properties?: Record<string, unknown>;
};

type AnalyticsConfig = {
  enabled?: boolean;
  endpoint?: string; // defaults to `${API_URL}/api/telemetry`
  flushIntervalMs?: number;
  maxBatchSize?: number;
};

const ANON_ID_KEY = 'repoview_anonymous_id';

function getOrCreateAnonymousId(): string {
  try {
    const existing = localStorage.getItem(ANON_ID_KEY);
    if (existing) return existing;
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(ANON_ID_KEY, id);
    return id;
  } catch {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

const VISIT_COUNT_KEY = 'repoview_visit_count';

function getVisitCount(): number {
  try {
    return parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

function incrementVisitCount() {
  try {
    const count = getVisitCount() + 1;
    localStorage.setItem(VISIT_COUNT_KEY, count.toString());
  } catch {
    // ignore
  }
}

function nowIso() {
  return new Date().toISOString();
}

function safePage(): string {
  try {
    return `${window.location.pathname}${window.location.search}`;
  } catch {
    return '';
  }
}

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

class AnalyticsClient {
  private enabled = true;
  private endpoint = `${API_URL}/api/telemetry`;

  init(config?: AnalyticsConfig) {
    this.enabled = config?.enabled ?? true;
    this.endpoint = config?.endpoint ?? `${API_URL}/api/telemetry`;
    
    if (!this.enabled) return;
    incrementVisitCount();
  }

  page(pageName?: string, props?: Record<string, unknown>) {
    this.track('page_view', {
      ...props,
      pageName,
    });
  }

  track(event: string, properties?: Record<string, unknown>) {
    if (!this.enabled) return;

    const anonymousId = getOrCreateAnonymousId();
    const page = safePage();

    const ev: TelemetryEvent = {
      timestamp: nowIso(),
      event,
      anonymousId,
      page,
      properties: {
        ...properties,
        visitCount: getVisitCount(),
      },
    };

    void this.send(ev);
  }

  trackButtonClick(label: string | undefined, meta?: Record<string, unknown>) {
    this.track('button_click', {
      label,
      ...meta,
    });
  }

  trackApiFail(params: {
    method: string;
    url: string;
    status?: number;
    message?: string;
    requestId?: string;
    userId?: string;
  }) {
    if (!this.enabled) return;

    const ev: TelemetryEvent = {
      timestamp: nowIso(),
      event: 'api_fail',
      anonymousId: getOrCreateAnonymousId(),
      page: safePage(),
      userId: params.userId,
      requestId: params.requestId,
      properties: {
        method: params.method,
        url: params.url,
        status: params.status,
        message: params.message,
        visitCount: getVisitCount(),
      },
    };

    void this.send(ev);
  }

  private async send(event: TelemetryEvent) {
    if (!this.enabled) return;

    // Send as single event object; backend supports this (coerceEvents: [body])
    const payload = event;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-Id': createRequestId(),
    };

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        keepalive: true, // critical for not losing events on navigation
      });
    } catch {
      // drop on failure (primary sink = server logs; we don't want user-facing errors)
    }
  }
}

export const analytics = new AnalyticsClient();

export function initAnalytics(config?: AnalyticsConfig) {
  analytics.init(config);
}

export function newClientRequestId() {
  return createRequestId();
}
