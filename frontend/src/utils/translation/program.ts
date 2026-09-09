import type { Program, ProgramTranslation } from "@/types/programs";

export function applyProgramTranslation(
    program: Program,
    translation: ProgramTranslation,
): Program {
    return {
        ...program,
        ...translation,
        acf: {
            ...program.acf,
            ...translation.acf,
            cta: {
                ...program.acf.cta,
                ...translation.acf.cta,
            },
            highlights: program.acf.highlights.map((highlight, i) => ({
                ...highlight,
                ...translation.acf.highlights[i],
            })),
            benefits: program.acf.benefits.map((benefit, i) => ({
                ...benefit,
                ...translation.acf.benefits[i],
            })),
        },
    };
}
