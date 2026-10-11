import { API_URL } from "@/consts/api";
import { HttpAdapterImpl } from "@/core/shared/adapters/HttpAdapterImpl";
import { SendLeadArgsSchema } from "@/schemas/leads";
import { defineAction } from "astro:actions";

export const sendLead = defineAction({
    accept: "json",
    input: SendLeadArgsSchema,
    handler: async ({ email, message, name, subject, company, phone }) => {
        try {
            const http = new HttpAdapterImpl();

            const ENV_API_URL =
                import.meta.env?.API_URL || process.env.API_URL || "";

            const fullUrl = `${ENV_API_URL}/wp/wp-json/contact-form-7/v1/contact-forms/129/feedback`;

            const FD = new FormData();
            FD.append("your-name", name);
            FD.append("your-email", email);
            FD.append("your-subject", subject);
            FD.append("your-phone-number", phone || "");
            FD.append("your-message", message);
            FD.append("your-company", company || "");
            FD.append("_wpcf7_unit_tag", "wpcf7-f129-p0-o1");

            await http.post(fullUrl, FD);

            return { success: true };
        } catch {
            return { success: false };
        }
    },
});
