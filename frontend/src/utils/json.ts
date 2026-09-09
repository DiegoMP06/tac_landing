
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

export function jsonToString<T extends object>(entity: T): string {
    return JSON.stringify(entity);
}

export function stringToJson<T>(value: unknown): T | unknown {
    if (typeof value === "string") {
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }
    return value as T;
}

