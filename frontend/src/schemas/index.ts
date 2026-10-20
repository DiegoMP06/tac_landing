import { BrandsEnum, SubBrands } from "@/enums";
import { FeaturedImagesSizesEnum } from "@/enums/images";
import { z } from "astro/zod";

export const FeaturedImageSizesSchema = z.enum(FeaturedImagesSizesEnum);

export const FeaturedImageAttSchema = z.object({
    url: z.string(),
    width: z.number(),
    height: z.number(),
});

export const FeaturedImagesSchema = z
    .object({
        sizes: z
            .partialRecord(FeaturedImageSizesSchema, FeaturedImageAttSchema)
            .nullable(),
        is_svg: z.literal(false),
    })
    .or(
        z.object({
            is_svg: z.literal(true),
            full: z.object({
                url: z.string(),
                width: z.number().nullable(),
                height: z.number().nullable(),
            }),
            content: z.string(),
        }),
    )
    .nullable();

export const DefaultWordpressSchema = z.object({
    id: z.number(),
    slug: z.string(),
    excerpt: z.object({
        rendered: z.string(),
    }).nullable().optional(),
    title: z.object({
        rendered: z.string(),
    }),
    content: z.object({
        rendered: z.string(),
    }),
    site: z.object({
        id: z.number(),
        name: z.string(),
        url: z.url(),
        domain: z.string().nullable().optional(),
        variant: z.enum(BrandsEnum),
    }),
    date_gmt: z.string().optional(),
    modified_gmt: z.string().optional(),
});

export const CtaSchema = z.object({
    title: z.string(),
    description: z.string(),
    redirect_text: z.string(),
    redirect_url: z.url(),
    secondary_redirect_text: z.string(),
    secondary_redirect_url: z.url().or(z.literal("")),
    hero_image: FeaturedImagesSchema,
});

export const CtaTranslationSchema = CtaSchema.pick({
    title: true,
    description: true,
    redirect_text: true,
    redirect_url: true,
    secondary_redirect_text: true,
    secondary_redirect_url: true,
});

const MarkerSchema = z.object({
    label: z.string(),
    lat: z.number(),
    lng: z.number(),
});

export const LocationSchema = z
    .object({
        lat: z.number(),
        lng: z.number(),
        zoom: z.number(),
        address: z.string(),
        markers: z.array(MarkerSchema),
    })
    .nullable()
    .optional();

export const HighlightSchema = z.object({
    title: z.string(),
    description: z.string(),
    icon: FeaturedImagesSchema,
});

export const HighlightTranslationSchema = HighlightSchema.pick({
    title: true,
    description: true,
});

export const BrandSchema = z.enum(SubBrands);
