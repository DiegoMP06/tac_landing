import { MessageRoleEnum } from "@/enums/chat";
import { useChatStore } from "@/stores/chat";
import type { StoreMessage } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import Loader from "../Loader";

type MessageItemProps = {
    item: StoreMessage;
};

export default function MessageItem({ item }: MessageItemProps) {
    const loading = useChatStore((state) => state.loading);
    const isUser = item.message.role === MessageRoleEnum.USER;

    return (
        <div
            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
        >
            <div
                className={`max-w-[85%] px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                    isUser
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                        : "bg-muted text-foreground rounded-2xl rounded-bl-sm border border-border/50"
                }`}
            >
                {isUser ? (
                    <div className="whitespace-pre-wrap">
                        {item.message.content}
                    </div>
                ) : item.message.content ? (
                    <div className="prose prose-sm dark:prose-invert text-foreground max-w-none wrap-break-word">
                        <ReactMarkdown>{item.message.content}</ReactMarkdown>
                    </div>
                ) : loading ? (
                    <Loader />
                ) : (
                    ""
                )}
            </div>
        </div>
    );
}
