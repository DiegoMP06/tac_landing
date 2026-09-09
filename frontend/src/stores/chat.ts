import { ChatModeEnum } from "@/enums/chat";
import type { ChatMode, StoreMessage } from "@/types/chat";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ChatState = {
    open: boolean;
    loading: boolean;
    messages: StoreMessage[];
    mode: ChatMode;
    setIsOpen: (open: boolean) => void;
    setIsLoading: (loading: boolean) => void;
    addMessage: (message: StoreMessage) => void;
    setMessages: (messages: StoreMessage[]) => void;
    editMessage: (id: string, message: StoreMessage) => void;
    clearMessages: () => void;
    setMode: (mode: ChatMode) => void;
};

export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            messages: [],
            open: false,
            loading: false,
            mode: ChatModeEnum.CHAT,
            setIsOpen: (open) => set({ open }),
            setIsLoading: (loading) => set({ loading }),
            addMessage: (message) =>
                set((state) => ({
                    messages: [...state.messages, message],
                })),
            setMessages: (messages) => set({ messages }),
            editMessage: (id, newMessage) =>
                set((state) => ({
                    messages: state.messages.map((msg) =>
                        msg.message.id === id ? newMessage : msg,
                    ),
                })),
            clearMessages: () => set({ messages: [] }),
            setMode: (mode) => set({ mode }),
        }),
        {
            name: "chat-storage",
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({ messages: state.messages }),
        },
    ),
);
