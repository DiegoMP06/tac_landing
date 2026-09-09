import { MessageRoleEnum } from "@/enums/chat";
import { z } from "astro/zod";

export const MessageSchema = z.object({
    role: z.enum(MessageRoleEnum),
    content: z.string(),
});
