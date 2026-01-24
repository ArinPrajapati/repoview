import { inspect } from 'node:util';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type JsonValue =
    | null
    | boolean
    | number
    | string
    | JsonValue[]
    | { [key: string]: JsonValue };

export type LogFields = Record<string, unknown>;

function safeSerializeError(error: unknown): JsonValue {
    if (!error) return null;

    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack ?? null,
        };
    }

    if (typeof error === 'object') {
        try {
            return JSON.parse(
                safeStringify(error, {
                    maxDepth: 4,
                    maxArrayLength: 50,
                    maxStringLength: 2000,
                })
            ) as JsonValue;
        } catch {
            return { message: inspect(error) };
        }
    }

    return { message: String(error) };
}

function safeStringify(
    value: unknown,
    options?: {
        maxDepth?: number;
        maxArrayLength?: number;
        maxStringLength?: number;
    }
): string {
    const maxDepth = options?.maxDepth ?? 6;
    const maxArrayLength = options?.maxArrayLength ?? 100;
    const maxStringLength = options?.maxStringLength ?? 8000;

    const seen = new WeakSet<object>();

    const normalize = (input: unknown, depth: number): unknown => {
        if (depth > maxDepth) return '[MaxDepth]';

        if (input === null) return null;
        if (typeof input === 'string') {
            return input.length > maxStringLength
                ? `${input.slice(0, maxStringLength)}…[truncated]`
                : input;
        }
        if (typeof input === 'number' || typeof input === 'boolean') return input;
        if (typeof input === 'bigint') return input.toString();
        if (typeof input === 'undefined') return null;
        if (typeof input === 'function') return `[Function${input.name ? `:${input.name}` : ''}]`;
        if (typeof input === 'symbol') return input.toString();

        if (input instanceof Error) {
            return safeSerializeError(input);
        }

        if (Array.isArray(input)) {
            const trimmed = input.slice(0, maxArrayLength);
            const mapped = trimmed.map((item) => normalize(item, depth + 1));
            if (input.length > maxArrayLength) {
                mapped.push(`[+${input.length - maxArrayLength} more]`);
            }
            return mapped;
        }

        if (typeof input === 'object') {
            const obj = input as Record<string, unknown>;
            if (seen.has(obj)) return '[Circular]';
            seen.add(obj);

            const out: Record<string, unknown> = {};
            for (const [key, val] of Object.entries(obj)) {
                out[key] = normalize(val, depth + 1);
            }
            return out;
        }

        return String(input);
    };

    return JSON.stringify(normalize(value, 0));
}

function baseFields() {
    return {
        timestamp: new Date().toISOString(),
        service: process.env.SERVICE_NAME ?? 'repoview-api',
        env: process.env.NODE_ENV ?? 'development',
    };
}

function writeLine(level: LogLevel, message: string, fields?: LogFields) {
    const entry: Record<string, unknown> = {
        ...baseFields(),
        level,
        message,
        ...(fields ?? {}),
    };

    // Normalize common error field
    if ('error' in entry) {
        entry.error = safeSerializeError(entry.error);
    }

    const line = safeStringify(entry);
    const stream = level === 'error' ? process.stderr : process.stdout;
    stream.write(`${line}\n`);
}

export const logger = {
    debug(fields: LogFields | undefined, message: string) {
        writeLine('debug', message, fields);
    },
    info(fields: LogFields | undefined, message: string) {
        writeLine('info', message, fields);
    },
    warn(fields: LogFields | undefined, message: string) {
        writeLine('warn', message, fields);
    },
    error(fields: LogFields | undefined, message: string) {
        writeLine('error', message, fields);
    },
};

export function redactEmail(email: string): string {
    // Keep domain, truncate local-part
    const at = email.indexOf('@');
    if (at <= 1) return '[redacted-email]';
    const local = email.slice(0, at);
    const domain = email.slice(at + 1);
    return `${local[0]}***@${domain}`;
}

export function safeJson(value: unknown): string {
    return safeStringify(value);
}
