import esTranslations from "./locales/es.json";
import enTranslations from "./locales/en.json";
import ptTranslations from "./locales/pt.json";

export const languages = {
    es: "Español",
    en: "English",
    pt: "Português",
};

export const ui = {
    es: esTranslations,
    en: enTranslations,
    pt: ptTranslations,
} as const;
