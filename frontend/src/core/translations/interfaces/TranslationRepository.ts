import type {
    Translation,
    DraftTranslation,
} from "@/core/translations/entities/Translation";

export type GetExactTranslationArgs = Pick<
    DraftTranslation,
    "key" | "locale" | "namespace" | "brand"
>;

export type GetAllTranslationsArgs = {
    items: Pick<DraftTranslation, "key">[];
} & Pick<DraftTranslation, "locale" | "namespace" | "brand">;

export type SaveTranslationArgs = Pick<
    DraftTranslation,
    | "brand"
    | "namespace"
    | "key"
    | "locale"
    | "originalText"
    | "translatedText"
    | "provider"
    | "hash"
>;

export type SaveManyTranslationsArgs = {
    items: Pick<
        DraftTranslation,
        "key" | "originalText" | "translatedText" | "hash"
    >[];
} & Pick<DraftTranslation, "namespace" | "locale" | "brand" | "provider">;

export abstract class TranslationRepository {
    abstract getTranslation(
        args: GetExactTranslationArgs,
    ): Promise<Translation | null>;

    abstract saveTranslation(args: SaveTranslationArgs): Promise<Translation>;

    abstract getAllTranslations(
        args: GetAllTranslationsArgs,
    ): Promise<Translation[]>;

    abstract saveManyTranslations(
        args: SaveManyTranslationsArgs,
    ): Promise<Translation[]>;
}
