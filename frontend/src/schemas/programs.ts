import { z } from "astro/zod";
import {
    CtaSchema,
    CtaTranslationSchema,
    DefaultWordpressSchema,
    FeaturedImagesSchema,
    HighlightSchema,
    HighlightTranslationSchema,
    LocationSchema,
} from ".";
import { ModalitiesEnum } from "@/enums";
import { DurationTypeEnum } from "@/enums/program";

export const BenefitSchema = z.object({
    title: z.string(),
    description: z.string(),
    icon: FeaturedImagesSchema,
});

const BenefitTranslationSchema = BenefitSchema.pick({
    title: true,
    description: true,
});

const ACFSchema = z.object({
    cta: CtaSchema,
    subtitle: z.string(),
    description: z.string(),
    target_audience: z.string(),
    duration_type: z.enum(DurationTypeEnum),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    duration_per_months: z.coerce.number().optional(),
    duration_per_weeks: z.coerce.number().optional(),
    featured: z.boolean(),
    location: LocationSchema,
    modality: z.enum(ModalitiesEnum),
    online_link: z.string().nullable().optional(),
    benefits: z.array(BenefitSchema),
    highlights: z.array(HighlightSchema),
});

const ACFTranslationSchema = ACFSchema.extend({
    cta: CtaTranslationSchema,
    benefits: z.array(BenefitTranslationSchema),
    highlights: z.array(HighlightTranslationSchema),
});

export const ProgramSchema = DefaultWordpressSchema.extend({
    acf: ACFSchema,
    images: FeaturedImagesSchema,
});

export const ListProgramsSchema = z.array(ProgramSchema);

export const ProgramTranslationSchema = DefaultWordpressSchema.pick({
    id: true,
    title: true,
    content: true,
    slug: true,
}).extend({
    acf: ACFTranslationSchema,
});
