import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import type { Program } from "@/types/programs";
import type { Locale } from "@/types/locale";
import type { Brand } from "@/types";
import type { TranslationProvider } from "../interfaces/TranslationProvider";
import type { TranslationRepository } from "../interfaces/TranslationRepository";
import { TranslationNamespacesEnum } from "@/enums/translation";
import { TRANSLATION_PROVIDER } from "@/consts/translation";
import { ProgramTranslationSchema } from "@/schemas/programs";
import { sanitizeHtml } from "@/utils/html";
import { extractJSON, jsonToString, stringToJson } from "@/utils/json";
import { hashText } from "@/utils/hash";
import { applyProgramTranslation } from "@/utils/translation/program";

type ProgramTranslationArgs = {
    translation: TranslationProvider;
    repository: TranslationRepository;
    logger: LoggerAdapter;
};

type TranslateParams = {
    program: Program;
    programs: Program[];
    locale: Locale;
    brand: Brand;
    entityId: string;
};

export class ProgramTranslationService {
    private readonly translation: TranslationProvider;
    private readonly repository: TranslationRepository;
    private readonly logger: LoggerAdapter;
    private readonly provider = TRANSLATION_PROVIDER;
    private readonly namespace = TranslationNamespacesEnum.EVENT;

    constructor({ translation, repository, logger }: ProgramTranslationArgs) {
        this.translation = translation;
        this.repository = repository;
        this.logger = logger;
    }

    async translateProgram({
        program,
        locale,
        brand,
    }: Pick<TranslateParams, "program" | "locale" | "brand">): Promise<{
        program: Program;
        cacheId: string;
    }> {
        const entityId = program.id;
        const readyForTranslation = ProgramTranslationSchema.parse(program);
        readyForTranslation.content.rendered = sanitizeHtml(
            readyForTranslation.content.rendered,
        );
        const stringEntity = jsonToString(readyForTranslation);
        const hash = hashText(stringEntity);
        const key = String(entityId);

        const existing = await this.repository.getTranslation({
            key,
            locale,
            namespace: this.namespace,
            brand,
        });

        if (existing && !existing.isStale(hash)) {
            this.logger.debug(`Using DB translation ${key}`);
            const parsed = ProgramTranslationSchema.parse(
                existing.translatedText,
            );
            return {
                program: applyProgramTranslation(program, parsed),
                cacheId: existing.id,
            };
        }

        if (this.translation.isDefaultLocale()) {
            const saved = await this.repository.saveTranslation({
                hash,
                key,
                locale,
                namespace: this.namespace,
                brand,
                originalText: readyForTranslation,
                translatedText: readyForTranslation,
                provider: this.provider,
            });

            this.logger.debug(`Without translation ${entityId}`);
            return { program, cacheId: saved.id };
        }

        const translatedRaw = await this.translation.translate(stringEntity);
        const parsedJson = stringToJson(extractJSON(translatedRaw));
        const parsed = ProgramTranslationSchema.parse(parsedJson);

        const saved = await this.repository.saveTranslation({
            hash,
            key,
            locale,
            namespace: this.namespace,
            brand,
            originalText: readyForTranslation,
            translatedText: parsed,
            provider: this.provider,
        });

        this.logger.debug(`Using IA translation ${key}`);
        return {
            program: applyProgramTranslation(program, parsed),
            cacheId: saved.id,
        };
    }

    async translateArrayPrograms({
        programs,
        locale,
        brand,
    }: Pick<TranslateParams, "programs" | "locale" | "brand">): Promise<{
        programs: Program[];
        cacheIds: Map<string, string>;
    }> {
        const cacheIds = new Map<string, string>();

        const prepared = programs.map((program) => {
            const entityId = program.id;
            const readyForTranslation = ProgramTranslationSchema.parse(program);
            readyForTranslation.content.rendered = sanitizeHtml(
                readyForTranslation.content.rendered,
            );
            const stringEntity = jsonToString(readyForTranslation);
            const hash = hashText(stringEntity);
            const key = String(entityId);

            return { program, key, hash, readyForTranslation, stringEntity };
        });

        const allExisting = await this.repository.getAllTranslations({
            namespace: this.namespace,
            locale,
            brand,
            items: prepared.map(({ key }) => ({ key })),
        });

        allExisting.forEach((x) => cacheIds.set(x.key, x.id));

        const existingByKey = new Map(
            allExisting.map((translation) => [translation.key, translation]),
        );
        const fresh = new Map<string, unknown>();

        const pending = prepared.filter((program) => {
            const cached = existingByKey.get(program.key);
            if (!cached) return true;
            if (cached.isStale(program.hash)) return true;
            fresh.set(program.key, cached.translatedText);
            return false;
        });

        if (this.translation.isDefaultLocale()) {
            if (pending.length > 0) {
                const savedDefaults =
                    await this.repository.saveManyTranslations({
                        namespace: this.namespace,
                        locale,
                        brand,
                        provider: this.provider,
                        items: pending.map((program) => ({
                            key: program.key,
                            originalText: program.readyForTranslation,
                            translatedText: program.readyForTranslation,
                            hash: program.hash,
                        })),
                    });

                savedDefaults.forEach((x) => cacheIds.set(x.key, x.id));
            }

            return {
                programs,
                cacheIds,
            };
        }

        let newTranslations = new Map<string, string>();

        if (pending.length > 0) {
            try {
                newTranslations = await this.translation.translateMany(
                    pending.map((program) => ({
                        key: program.key,
                        text: program.stringEntity,
                    })),
                );
            } catch (err) {
                this.logger.error(
                    `[ProgramTranslationService] translateMany failed, returning originals for pending items: ${err}`,
                );
            }

            const itemsToSave = [];
            for (const program of pending) {
                const rawTranslation = newTranslations.get(program.key);
                if (!rawTranslation) continue;

                try {
                    const parsed = ProgramTranslationSchema.parse(
                        stringToJson(extractJSON(rawTranslation)),
                    );
                    itemsToSave.push({
                        key: program.key,
                        originalText: program.readyForTranslation,
                        translatedText: parsed,
                        hash: program.hash,
                    });
                } catch (err) {
                    this.logger.error(
                        `[ProgramTranslationService] Invalid translation structure for program ${program.key}: ${err}`,
                    );
                }
            }

            if (itemsToSave.length > 0) {
                const allSaved = await this.repository.saveManyTranslations({
                    namespace: this.namespace,
                    locale,
                    brand,
                    provider: this.provider,
                    items: itemsToSave,
                });

                allSaved.forEach((x) => cacheIds.set(x.key, x.id));
            }
        }

        const allPrograms = prepared.map(({ program, key }) => {
            const cachedOrNew = fresh.get(key) ?? newTranslations.get(key);

            if (!cachedOrNew) {
                return program;
            }

            try {
                const parsedTranslation =
                    typeof cachedOrNew === "string"
                        ? stringToJson(extractJSON(cachedOrNew))
                        : cachedOrNew;

                const validatedTranslation =
                    ProgramTranslationSchema.parse(parsedTranslation);
                return applyProgramTranslation(program, validatedTranslation);
            } catch (err) {
                this.logger.error(
                    `[ProgramTranslationService] Validation failed for program ${key}, returning original: ${err}`,
                );
                return program;
            }
        });

        return {
            programs: allPrograms,
            cacheIds,
        };
    }
}
