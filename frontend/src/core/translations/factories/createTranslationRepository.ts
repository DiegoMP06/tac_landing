// src/core/translations/factories/createTranslationRepository.ts
import { EmbeddingProviderImpl } from "@/core/chatbot/providers/EmbeddingProviderImpl";
import { EmbeddingRepositoryImpl } from "@/core/chatbot/repositories/EmbeddingRepositoryImpl";
import { EmbeddingSyncTranslationRepository } from "@/core/chatbot/repositories/EmbeddingSyncTranslationRepository";
import { EmbeddingIndexService } from "@/core/chatbot/services/EmbeddingIndexService";
import type { TranslationRepository } from "@/core/translations/interfaces/TranslationRepository";
import { TranslationRepositoryImpl } from "@/core/translations/repositories/TranslationRepositoryImpl";

let cachedIndexService: EmbeddingIndexService | null = null;

function getEmbeddingIndexService(): EmbeddingIndexService {
    if (!cachedIndexService) {
        cachedIndexService = new EmbeddingIndexService(
            new EmbeddingRepositoryImpl(),
            new EmbeddingProviderImpl(),
        );
    }
    return cachedIndexService;
}

export function createTranslationRepository(): TranslationRepository {
    const baseRepository = new TranslationRepositoryImpl();
    return new EmbeddingSyncTranslationRepository(
        baseRepository,
        getEmbeddingIndexService(),
    );
}
