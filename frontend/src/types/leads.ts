import type { SendLeadArgsSchema } from "@/schemas/leads";
import { z } from "astro/zod";

export type SendLeadArgs = z.infer<typeof SendLeadArgsSchema>;
