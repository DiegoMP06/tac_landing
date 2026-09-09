import type { PageTypeEnum } from "@/enums/pages";
import {
    AboutPageSchema,
    AboutPageTranslationSchema,
    CardSchema,
    ContactPageSchema,
    ContactPageTranslationSchema,
    HomePageSchema,
    HomePageTranslationSchema,
    PageSchema,
    PageTranslationSchema,
    TitleAndContentCardSchema,
    ContactItemSchema,
} from "@/schemas/pages";
import type { z } from "astro/zod";

export type Page = z.infer<typeof PageSchema>;
export type PageTranslation = z.infer<typeof PageTranslationSchema>;

export type HomePage = z.infer<typeof HomePageSchema>;
export type HomePageTranslation = z.infer<typeof HomePageTranslationSchema>;

export type Card = z.infer<typeof CardSchema>;
export type TitleAndContentCard = z.infer<typeof TitleAndContentCardSchema>;

export type AboutPage = z.infer<typeof AboutPageSchema>;
export type AboutPageTranslation = z.infer<typeof AboutPageTranslationSchema>;

export type ContactPage = z.infer<typeof ContactPageSchema>;
export type ContactPageTranslation = z.infer<
    typeof ContactPageTranslationSchema
>;
export type ContactItem = z.infer<typeof ContactItemSchema>;

export type PageType = (typeof PageTypeEnum)[keyof typeof PageTypeEnum];

export type PageTypeMap = {
    default: Page;
    home: HomePage;
    contact: ContactPage;
    about: AboutPage;
};

export type PageTranslationTypeMap = {
    default: PageTranslation;
    home: HomePageTranslation;
    contact: ContactPageTranslation;
    about: AboutPageTranslation;
};
