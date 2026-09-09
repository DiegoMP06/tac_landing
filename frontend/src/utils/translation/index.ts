import { USER_PROMPT } from "@/consts/translation";
import type { Locale } from "@/types/locale";
import { LOCALE_NAMES } from "@/consts";

export const buildUserPrompt = (locale: Locale, payload: string) => {
    const localeName = LOCALE_NAMES[locale];

    const promptBuilded = USER_PROMPT.replaceAll("{{ locale }}", localeName)
        .replaceAll("{{ locale_code }}", locale)
        .replaceAll("{{ payload }}", payload);

    return promptBuilded;
};
