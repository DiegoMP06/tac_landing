import { ChatbotRepositoryImpl } from "@/core/chatbot/repositories/ChatbotRepositoryImpl";
import { ChannelEnum } from "@/enums/chat";
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

            const conversation = await chatbotRepository.findActiveSession({
                sessionToken,
                channel: ChannelEnum.WEB,
                phone: null,
            });

            return conversation;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
});
