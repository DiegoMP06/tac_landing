import { z } from "astro/zod";

export const LeadChannelEnum = z.enum(["email", "whatsapp"]);
export type LeadChannel = z.infer<typeof LeadChannelEnum>;

export const leadSchema = z.object({
    channel: LeadChannelEnum,
    name: z
        .string()
        .trim()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    email: z
        .string()
        .trim()
        .email({ message: "Por favor ingresa un correo electrónico válido." }),
    phone: z.string().trim().optional(),
    message: z
        .string()
        .trim()
        .min(5, { message: "El mensaje debe contener al menos 5 caracteres." })
        .or(z.literal("")),
    detectedIntent: z.string().optional().default("landing_chatbot_contact"),
});

export type LeadInput = z.infer<typeof leadSchema>;
