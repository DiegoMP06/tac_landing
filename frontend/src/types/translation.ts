import type { TranslationNamespacesEnum } from "@/enums/translation";

export type  TranslationNamespace = typeof TranslationNamespacesEnum[keyof typeof TranslationNamespacesEnum];
