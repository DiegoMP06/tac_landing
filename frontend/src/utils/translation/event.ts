import type { Event, EventTranslation } from "@/types/events";

export function applyEventTranslation(
    event: Event,
    translation: EventTranslation,
): Event {
    return {
        ...event,
        ...translation,
        acf: {
            ...event.acf,
            ...translation.acf,
            cta: {
                ...event.acf.cta,
                ...translation.acf.cta,
            },
            highlights: event.acf.highlights.map((highlight, i) => ({
                ...highlight,
                ...translation.acf.highlights[i],
            })),
            speakers: event.acf.speakers.map((speaker, i) => ({
                ...speaker,
                ...translation.acf.speakers[i],
            })),
        },
    };
}
