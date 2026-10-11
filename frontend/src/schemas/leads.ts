import { PHONE_REGEX } from "@/regex";
import { z } from "astro/zod";

export const SendLeadArgsSchema = z.object({
    name: z
        .string({ error: "Name is invalid" })
        .nonempty({ error: "Name is required" })
        .max(50, { message: "Name is too long" }),
    phone: z
        .string({ error: "Phone is invalid" })
        .regex(PHONE_REGEX, {
            message: "Phone number must match format +X-XXX-XXXX-XXXX",
        })
        .optional(),
    email: z
        .email({ error: "Email is invalid" })
        .nonempty({ error: "Email is required" }),
    company: z
        .string({ error: "Company is invalid" })
        .max(50, { message: "Company is too long" })
        .optional(),
    subject: z
        .string({ error: "Subject is invalid" })
        .nonempty({ error: "Subject is required" })
        .max(50, { message: "Subject is too long" }),
    message: z
        .string({ error: "Message is invalid" })
        .nonempty({ error: "Message is required" })
        .max(500, { message: "Message is too long" }),
});
