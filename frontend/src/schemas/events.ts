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

export const SpeakerSchema = z.object({
    name: z.string(),
    position: z.string().optional(),
    organization: z.string().optional(),
    linkedin: z.string().optional(),
    photo: FeaturedImagesSchema,
});

const SpeakerTranslationSchema = SpeakerSchema.pick({
    name: true,
    position: true,
    organization: true,
    linkedin: true,
});

const ACFSchema = z.object({
    cta: CtaSchema,
    subtitle: z.string(),
    description: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    featured: z.boolean(),
    location: LocationSchema,
    online_link: z.string().nullable().optional(),
    modality: z.enum(ModalitiesEnum),
    speakers: z.array(SpeakerSchema),
    highlights: z.array(HighlightSchema),
});

const ACFTranslationSchema = ACFSchema.extend({
    cta: CtaTranslationSchema,
    speakers: z.array(SpeakerTranslationSchema),
    highlights: z.array(HighlightTranslationSchema),
});

export const EventSchema = DefaultWordpressSchema.extend({
    images: FeaturedImagesSchema,
    acf: ACFSchema,
});

export const ListEventsSchema = z.array(EventSchema);

export const EventTranslationSchema = DefaultWordpressSchema.pick({
    id: true,
    title: true,
    content: true,
    slug: true,
}).extend({
    acf: ACFTranslationSchema,
});
