import { ChatbotRepositoryImpl } from "@/core/chatbot/repositories/ChatbotRepositoryImpl";
import { defineAction } from "astro:actions";

export const closeConversation = defineAction({
    accept: "json",
    handler: async (_input, { cookies }) => {
        const sessionToken = cookies.get("chat_session")?.value;

        if (!sessionToken) {
            return { success: true };
        }

        const chatbotRepository = new ChatbotRepositoryImpl();

        await chatbotRepository.closeConversationBySessionId({
            sessionToken,
        });

        cookies.delete("chat_session", { path: "/" });

        return { success: true };
    },
});
