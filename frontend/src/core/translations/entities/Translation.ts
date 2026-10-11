import { jsonToString } from "@/utils/json";

export type TranslationArgs = {
    id: string;
    brand: string;
    namespace: string;
    key: string;
    locale: string;
    originalText: unknown;
    translatedText: unknown;
    provider: string;
    hash: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export type DraftTranslation = Pick<
    TranslationArgs,
    | "brand"
    | "key"
    | "hash"
    | "locale"
    | "namespace"
    | "originalText"
    | "translatedText"
    | "provider"
>;

export class Translation {
    id: string;
    brand: string;
    namespace: string;
    key: string;
    locale: string;
    originalText: unknown;
    translatedText: unknown;
    provider: string;
    hash: string;
    createdAt?: Date;
    updatedAt?: Date;

    public static create(args: TranslationArgs): Translation {
        return new Translation(args);
    }

    constructor({
        id,
        brand,
        namespace,
        key,
        locale,
        originalText,
        translatedText,
        provider,
        hash,
        createdAt,
        updatedAt,
    }: TranslationArgs) {
        this.id = id;
        this.brand = brand;
        this.namespace = namespace;
        this.key = key;
        this.locale = locale;
        this.originalText = originalText;
        this.translatedText = translatedText;
        this.provider = provider;
        this.hash = hash;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public isStale(currentHash: string): boolean {
        return this.hash !== currentHash;
    }

    public getTranslatedText(): string {
        return jsonToString(this.translatedText);
    }
}
