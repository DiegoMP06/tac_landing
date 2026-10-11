export function extractJSON(raw: string): string {
    let cleaned = raw
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    return cleaned;
}

export function jsonToString<T = unknown>(value: T): string {
    return typeof value === "string" ? value : JSON.stringify(value);
}

export function stringToJson<T = unknown>(value: unknown): T {
    if (typeof value === "string") {
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }
    return value as T;
}
