import { PageTypeEnum } from "@/enums/pages";
import {
    AboutPageSchema,
    AboutPageTranslationSchema,
    ContactPageSchema,
    ContactPageTranslationSchema,
    HomePageSchema,
    HomePageTranslationSchema,
    PageSchema,
    PageTranslationSchema,
} from "@/schemas/pages";
import type {
    AboutPage,
    AboutPageTranslation,
    ContactPage,
    ContactPageTranslation,
    HomePage,
    HomePageTranslation,
    Page,
    PageTranslation,
    PageType,
    PageTypeMap,
    PageTranslationTypeMap,
} from "@/types/pages";
import type { z } from "astro/zod";

export function applyPageTranslation(
    page: Page,
    translation: PageTranslation,
): Page {
    return {
        ...page,
        ...translation,
        acf: {
            ...page.acf,
            ...translation.acf,
            cta: {
                ...page.acf.cta,
                ...translation.acf.cta,
            },
        },
    };
}

export function applyContactPageTranslation(
    page: ContactPage,
    translation: ContactPageTranslation,
): ContactPage {
    return {
        ...page,
        ...translation,
        acf: {
            ...page.acf,
            ...translation.acf,
            cta: {
                ...page.acf.cta,
                ...translation.acf.cta,
            },
            contact: {
                ...page.acf.contact,
                ...translation.acf.contact,
                acc: {
                    ...page.acf.contact.acc,
                    ...translation.acf.contact.acc,
                },
                acm: {
                    ...page.acf.contact.acm,
                    ...translation.acf.contact.acm,
                },
                acu: {
                    ...page.acf.contact.acu,
                    ...translation.acf.contact.acu,
                },
            },
        },
    };
}

export function applyAboutPageTranslation(
    page: AboutPage,
    translation: AboutPageTranslation,
): AboutPage {
    return {
        ...page,
        ...translation,
        acf: {
            ...page.acf,
            ...translation.acf,
            cta: {
                ...page.acf.cta,
                ...translation.acf.cta,
            },
        },
    };
}

export function applyHomePageTranslation(
    page: HomePage,
    translation: HomePageTranslation,
): HomePage {
    return {
        ...page,
        ...translation,
        acf: {
            ...page.acf,
            ...translation.acf,
            cta: {
                ...page.acf.cta,
                ...translation.acf.cta,
            },
            rest_break: {
                ...page.acf.rest_break,
                ...translation.acf.rest_break,
            },
            commitments: {
                ...page.acf.commitments,
                ...translation.acf.commitments,
                cards: page.acf.commitments.cards.map((card, index) => ({
                    ...card,
                    ...translation.acf.commitments.cards[index],
                })),
            },
            impact: {
                ...page.acf.impact,
                ...translation.acf.impact,
                cards: page.acf.impact.cards.map((card, index) => ({
                    ...card,
                    ...translation.acf.impact.cards[index],
                })),
            },
        },
    };
}

type PageDictMap = {
    [K in PageType]: {
        schema: z.ZodSchema<PageTypeMap[K]>;
        translationSchema: z.ZodSchema<PageTranslationTypeMap[K]>;
        applyTranslation: (
            page: PageTypeMap[K],
            translation: PageTranslationTypeMap[K],
        ) => PageTypeMap[K];
    };
};

export const PageDict: PageDictMap = {
    [PageTypeEnum.HOME]: {
        schema: HomePageSchema,
        translationSchema: HomePageTranslationSchema,
        applyTranslation: applyHomePageTranslation,
    },
    [PageTypeEnum.ABOUT]: {
        schema: AboutPageSchema,
        translationSchema: AboutPageTranslationSchema,
        applyTranslation: applyAboutPageTranslation,
    },
    [PageTypeEnum.CONTACT]: {
        schema: ContactPageSchema,
        translationSchema: ContactPageTranslationSchema,
        applyTranslation: applyContactPageTranslation,
    },
    [PageTypeEnum.DEFAULT]: {
        schema: PageSchema,
        translationSchema: PageTranslationSchema,
        applyTranslation: applyPageTranslation,
    },
};
