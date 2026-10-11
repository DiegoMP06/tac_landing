import { z } from "astro/zod";
import { DefaultWordpressSchema, FeaturedImagesSchema } from ".";

const ACFSchema = z.object({
    subtitle: z.string(),
    description: z.string(),
});

const ACFTranslationSchema = ACFSchema.pick({
    description: true,
    subtitle: true,
});

export const PostSchema = DefaultWordpressSchema.extend({
    images: FeaturedImagesSchema,
    acf: ACFSchema,
});

export const ListPostsSchema = z.array(PostSchema);

export const PostTranslationSchema = DefaultWordpressSchema.pick({
    id: true,
    title: true,
    content: true,
    slug: true,
}).extend({
    acf: ACFTranslationSchema,
});
