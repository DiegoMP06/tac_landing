import {
    TRANSLATION_MODEL,
    TRANSLATION_PROVIDER,
    TRANSLATION_TEMPERATURE,
    SYSTEM_PROMPT,
    USER_PROMPT,
} from "@/consts/translation";
import { Groq } from "groq-sdk";
import {
    TranslationProvider,
    type TranslatableItem,
} from "../interfaces/TranslationProvider";
import type { Locale } from "@/types/locale";
import { DEFAULT_LOCALE } from "@/consts/locale";
import { buildUserPrompt } from "@/utils/translation";
import { extractJSON } from "@/utils/json";

export class TranslationProviderImpl extends TranslationProvider {
    protected readonly apiKey: string;
    protected readonly model: string;
    protected readonly temperature: number;
    protected readonly defaultLocale: Locale;
    protected readonly systemInstruction: string;
    private readonly provider: Groq;
    protected readonly locale: Locale;

    constructor(locale: Locale) {
        super();
        const apiKey =
            import.meta.env?.GROQ_API_KEY || process.env.GROQ_API_KEY || "";
        if (!apiKey) {
            throw new Error(
                "[TranslationProviderImpl] GROQ_API_KEY no está configurada en las variables de entorno.",
            );
        }
        this.locale = locale;
        this.apiKey = apiKey;
        this.model = TRANSLATION_MODEL;
        this.temperature = TRANSLATION_TEMPERATURE;
        this.defaultLocale = DEFAULT_LOCALE;
        this.systemInstruction = SYSTEM_PROMPT;
        this.provider = new Groq({ apiKey: this.apiKey });
    }

    private async createCompletion(
        messages: Groq.Chat.ChatCompletionMessageParam[],
        maxCompletionTokens: number,
        retries = 1,
    ): Promise<string | undefined> {
        try {
            const response = await this.provider.chat.completions.create({
                model: this.model,
                temperature: this.temperature,
                reasoning_effort: "low",
                max_completion_tokens: maxCompletionTokens,
                response_format: { type: "json_object" },
                messages,
            });

            return response.choices[0]?.message?.content ?? undefined;
        } catch (err) {
            const isJsonValidationError =
                err instanceof Groq.APIError && err.status === 400;

            if (isJsonValidationError && retries > 0) {
                console.warn(
                    "[TranslationProviderImpl] json_validate_failed, reintentando...",
                    err.message,
                );

                return this.createCompletion(
                    messages,
                    maxCompletionTokens,
                    retries - 1,
                );
            }

            throw err;
        }
    }

    public override async translate(originalText: string): Promise<string> {
        const content = await this.createCompletion(
            [
                {
                    role: "system",
                    content: this.systemInstruction,
                },
                {
                    role: "user",
                    content: buildUserPrompt(this.locale, originalText),
                },
            ],
            2048,
        );

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
        const maxCompletionTokens = Math.min(
            Math.max(estimatedTokens * 2, 2048),
            8192,
        );

        const raw = await this.createCompletion(
            [
                {
                    role: "system",
                    content: this.systemInstruction,
                },
                {
                    role: "user",
                    content: buildUserPrompt(
                        this.locale,
                        JSON.stringify(payload),
                    ),
                },
            ],
            maxCompletionTokens,
        );

        if (!raw) {
            console.error(
                "[translateMany] Respuesta vacía de Groq tras reintentos",
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
                "[translateMany] Failed to parse Groq response:",
                err,
            );
        }

        return result;
    }
}
