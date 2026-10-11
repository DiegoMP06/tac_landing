import { DEFAULT_LOCALE } from "@/consts/locale";
import {
    SYSTEM_PROMPT,
    TRANSLATION_MODEL,
    TRANSLATION_TEMPERATURE
} from "@/consts/translation";
import type { Locale } from "@/types/locale";
import { extractJSON } from "@/utils/json";
import { buildUserPrompt } from "@/utils/translation";
import { GoogleGenAI } from "@google/genai";
import {
    TranslationProvider,
    type TranslatableItem,
} from "../interfaces/TranslationProvider";

export class TranslationProviderImpl extends TranslationProvider {
    protected readonly apiKey: string;
    protected readonly model: string;
    protected readonly temperature: number;
    protected readonly defaultLocale: Locale;
    protected readonly systemInstruction: string;
    private readonly client: GoogleGenAI;
    protected readonly locale: Locale;

    constructor(locale: Locale) {
        super();
        const apiKey =
            import.meta.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

        if (!apiKey) {
            throw new Error(
                "[TranslationProviderImpl] GEMINI_API_KEY no está configurada en las variables de entorno.",
            );
        }

        this.locale = locale;
        this.apiKey = apiKey;
        this.model = TRANSLATION_MODEL;
        this.temperature = TRANSLATION_TEMPERATURE;
        this.defaultLocale = DEFAULT_LOCALE;
        this.systemInstruction = SYSTEM_PROMPT;
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }

    private async createCompletion(
        userPrompt: string,
        maxOutputTokens: number,
        retries = 1,
    ): Promise<string | undefined> {
        try {
            const response = await this.client.models.generateContent({
                model: this.model,
                contents: userPrompt,
                config: {
                    systemInstruction: this.systemInstruction,
                    temperature: this.temperature,
                    maxOutputTokens,
                    responseMimeType: "application/json",
                },
            });

            return response.text || undefined;
        } catch (err) {
            const error = err as Error;
            const isJsonValidationError =
                error.message.includes("400") || error.message.includes("JSON");

            if (isJsonValidationError && retries > 0) {
                console.warn(
                    "[TranslationProviderImpl] json_validate_failed, reintentando...",
                    error.message,
                );

                return this.createCompletion(
                    userPrompt,
                    maxOutputTokens,
                    retries - 1,
                );
            }

            throw err;
        }
    }

    public override async translate(originalText: string): Promise<string> {
        const userPrompt = buildUserPrompt(this.locale, originalText);
        const content = await this.createCompletion(userPrompt, 2048);

        return content ?? originalText;
    }

    public override async translateMany(
        items: TranslatableItem[],
    ): Promise<Map<string, string>> {
        const result = new Map<string, string>();

        if (items.length === 0) return result;

        const payload = Object.fromEntries(
            items.map((item) => [item.key, JSON.parse(item.text)]),
        );

        const estimatedTokens = Math.ceil(JSON.stringify(payload).length / 3);
        const maxOutputTokens = Math.min(
            Math.max(estimatedTokens * 2, 2048),
            8192,
        );

        const userPrompt = buildUserPrompt(
            this.locale,
            JSON.stringify(payload),
        );
        const raw = await this.createCompletion(userPrompt, maxOutputTokens);

        if (!raw) {
            console.error(
                "[translateMany] Respuesta vacía de Gemini tras reintentos",
            );
            return result;
        }

        try {
            const parsed = JSON.parse(extractJSON(raw)) as Record<
                string,
                unknown
            >;

            const receivedIds = new Set(Object.keys(parsed));
            const expectedIds = new Set(items.map((item) => item.key));
            const missing = [...expectedIds].filter(
                (id) => !receivedIds.has(id),
            );

            if (missing.length > 0) {
                console.error(
                    `[translateMany] El modelo no devolvió traducción para ${missing.length} de ${items.length} items:`,
                    missing,
                );
            }

            for (const item of items) {
                const value = parsed[item.key];
                if (value !== undefined) {
                    result.set(item.key, JSON.stringify(value));
                }
            }
        } catch (err) {
            console.error(
                "[translateMany] Failed to parse Gemini response:",
                err,
            );
        }

        return result;
    }
}
