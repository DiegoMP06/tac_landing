import type { z } from "astro/zod";
import { FeaturedImagesSchema, FeaturedImageAttSchema, FeaturedImageSizesSchema } from "../schemas/index";

export type FeaturedImageSizes = z.infer<typeof FeaturedImageSizesSchema>
export type FeaturedImageAtt = z.infer<typeof FeaturedImageAttSchema>

export type FeaturedImages = z.infer<typeof FeaturedImagesSchema>;

