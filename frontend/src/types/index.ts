import { CtaSchema, LocationSchema } from "@/schemas";
import type { z } from "astro/zod";
import { HighlightSchema } from "../schemas";
import type { BrandsEnum, ModalitiesEnum } from "@/enums";

export type Brand = (typeof BrandsEnum)[keyof typeof BrandsEnum];

export type Modality = (typeof ModalitiesEnum)[keyof typeof ModalitiesEnum];

export type CTAType = z.infer<typeof CtaSchema>;

export type Location = z.infer<typeof LocationSchema>;

export type Highlight = z.infer<typeof HighlightSchema>;
