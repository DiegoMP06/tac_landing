import {
    EventSchema,
    EventTranslationSchema,
    ListEventsSchema,
    SpeakerSchema,
} from "@/schemas/events";
import type { z } from "astro/zod";

export type Event = z.infer<typeof EventSchema>;

export type Speaker = z.infer<typeof SpeakerSchema>;

export type ListEvents = z.infer<typeof ListEventsSchema>;

export type EventTranslation = z.infer<typeof EventTranslationSchema>;
