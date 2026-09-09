import type { Locale } from "@/types/locale";

export type TranslatableItem = {
    key: string;
    text: string;
};

export abstract class TranslationProvider {
    protected abstract apiKey: string;
    protected abstract model: string;
    protected abstract temperature: number;
    protected abstract defaultLocale: Locale;
    protected abstract systemInstruction: string;
    protected abstract locale: Locale;

    abstract translate(originalText: string): Promise<string>;

    abstract translateMany(
        items: TranslatableItem[],
    ): Promise<Map<string, string>>;

    public isDefaultLocale(): boolean {
        return this.locale === this.defaultLocale;
    }
}
