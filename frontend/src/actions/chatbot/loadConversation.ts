import { ChatbotRepositoryImpl } from "@/core/chatbot/repositories/ChatbotRepositoryImpl";
import { defineAction } from "astro:actions";

export const loadConversation = defineAction({
    accept: "json",
    handler: async (_input, { cookies }) => {
        const sessionToken = cookies.get("chat_session")?.value;

        if (!sessionToken) {
            return null;
        }

        try {
            const chatbotRepository = new ChatbotRepositoryImpl();

            await chatbotRepository.closeInactiveConversation({
                sessionToken,
                hours: 1,
            });

            const conversation = await chatbotRepository.findActiveSession({
                sessionToken,
            });

            if (!conversation) {
                cookies.delete("chat_session", { path: "/" });
            }

            return conversation;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
});
