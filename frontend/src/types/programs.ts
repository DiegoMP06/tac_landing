import type { DurationTypeEnum } from "@/enums/program";
import {
    BenefitSchema,
    ListProgramsSchema,
    ProgramSchema,
    ProgramTranslationSchema,
} from "@/schemas/programs";
import type { z } from "astro/zod";

export type Program = z.infer<typeof ProgramSchema>;

export type DurationType = typeof DurationTypeEnum[keyof typeof DurationTypeEnum]

export type Benefit = z.infer<typeof BenefitSchema>;

export type ListPrograms = z.infer<typeof ListProgramsSchema>;

export type ProgramTranslation = z.infer<typeof ProgramTranslationSchema>;
