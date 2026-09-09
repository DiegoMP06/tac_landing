import { z } from "astro/zod";
import {
    CtaSchema,
    CtaTranslationSchema,
    DefaultWordpressSchema,
    FeaturedImagesSchema,
} from ".";

const HeroSchema = z.object({
    subtitle: z.string(),
    description: z.string(),
    redirect_text: z.string(),
    redirect_url: z.url().or(z.literal("")),
    secondary_redirect_text: z.string(),
    secondary_redirect_url: z.url().or(z.literal("")),
});

const ContentSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    phrase: z.string(),
});

const ACFSchema = z.object({
    hero: HeroSchema,
    content: ContentSchema,
    cta: CtaSchema,
});

const ACFTranslationSchema = ACFSchema.extend({
    cta: CtaTranslationSchema,
});

export const PageSchema = DefaultWordpressSchema.extend({
    acf: ACFSchema,
    images: FeaturedImagesSchema,
});

export const PageTranslationSchema = DefaultWordpressSchema.pick({
    id: true,
    title: true,
    content: true,
    slug: true,
}).extend({
    acf: ACFTranslationSchema,
});

export const CardSchema = z.object({
    title: z.string(),
    content: z.string(),
    icon: FeaturedImagesSchema,
});

const CardTranslationSchema = CardSchema.pick({
    title: true,
    content: true,
});

export const CountDownSchema = z.object({
    enable: z.boolean(),
    title: z.string(),
    subtitle: z.string(),
    content: z.string(),
    redirect_text: z.string(),
    redirect_url: z.url().or(z.literal("")),
    date: z.string().nullable(),
});

export const CommitmentsSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    cards: z.array(CardSchema),
});

export const CommitmentsTranslationSchema = CommitmentsSchema.extend({
    cards: z.array(CardTranslationSchema),
});

export const ProgramsAndEventsSectionSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    limit: z.coerce.number(),
});

export const RestSectionSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    phrase: z.string(),
    content: z.string(),
    hero_image: FeaturedImagesSchema,
});

export const ImpactSectionSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    cards: z.array(CardSchema),
});

export const ImpactSectionTranslationSchema = ImpactSectionSchema.extend({
    cards: z.array(CardTranslationSchema),
});

export const HomePageSchema = PageSchema.extend({
    acf: ACFSchema.extend({
        count_down: CountDownSchema,
        commitments: CommitmentsSchema,
        programs_section: ProgramsAndEventsSectionSchema,
        rest_break: RestSectionSchema,
        impact: ImpactSectionSchema,
        events_section: ProgramsAndEventsSectionSchema,
    }),
});

export const HomePageTranslationSchema = PageTranslationSchema.extend({
    acf: ACFTranslationSchema.extend({
        count_down: CountDownSchema,
        commitments: CommitmentsTranslationSchema,
        programs_section: ProgramsAndEventsSectionSchema,
        rest_break: RestSectionSchema.pick({
            title: true,
            subtitle: true,
            phrase: true,
            content: true,
        }),
        impact: ImpactSectionTranslationSchema,
        events_section: ProgramsAndEventsSectionSchema,
    }),
});

export const TitleAndContentCardSchema = z.object({
    title: z.string(),
    content: z.string(),
});

export const MissionAndVisionSectionSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    mission: TitleAndContentCardSchema,
    vision: TitleAndContentCardSchema,
});

export const WhatWeDoSectionSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    cards: z.array(TitleAndContentCardSchema),
});

export const AboutPageSchema = PageSchema.extend({
    acf: ACFSchema.extend({
        mission_and_vision: MissionAndVisionSectionSchema,
        what_we_do: WhatWeDoSectionSchema,
    }),
});

export const AboutPageTranslationSchema = PageTranslationSchema.extend({
    acf: ACFTranslationSchema.extend({
        mission_and_vision: MissionAndVisionSectionSchema,
        what_we_do: WhatWeDoSectionSchema,
    }),
});

export const ContactItemSchema = z.object({
    title: z.string(),
    content: z.string(),
    address: z.string(),
    number_phone: z.string(),
    email: z.email(),
    schedule: z.string(),
});

export const ContactPageSchema = PageSchema.extend({
    acf: ACFSchema.extend({
        contact: z.object({
            title: z.string(),
            subtitle: z.string(),
            acm: ContactItemSchema,
            acc: ContactItemSchema,
            acu: ContactItemSchema,
        }),
    }),
});

export const ContactPageTranslationSchema = PageTranslationSchema.extend({
    acf: ACFTranslationSchema.extend({
        contact: z.object({
            title: z.string(),
            subtitle: z.string(),
            acm: ContactItemSchema,
            acc: ContactItemSchema,
            acu: ContactItemSchema,
        }),
    }),
});
