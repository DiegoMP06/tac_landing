import type { DraftMessage, Message } from "@/core/chatbot/entities/Message";
import type {
    ChannelEnum,
    ChatModeEnum,
    ChatStatusEnum,
    EmbedTaskTypeEnum,
    LeadsStatusEnum,
    MessageRoleEnum,
    ResponseFormatEnum,
} from "@/enums/chat";

export type ChatStatus = (typeof ChatStatusEnum)[keyof typeof ChatStatusEnum];

export type MessageRole =
    (typeof MessageRoleEnum)[keyof typeof MessageRoleEnum];

export type LeadsStatus =
    (typeof LeadsStatusEnum)[keyof typeof LeadsStatusEnum];

export type EmbedTaskType =
    (typeof EmbedTaskTypeEnum)[keyof typeof EmbedTaskTypeEnum];

export type ChatMode = (typeof ChatModeEnum)[keyof typeof ChatModeEnum];

export type Channel = (typeof ChannelEnum)[keyof typeof ChannelEnum];

export type ResponseFormat =
    (typeof ResponseFormatEnum)[keyof typeof ResponseFormatEnum];

export type StoreMessage =
    | { stored: true; message: Message }
    | { stored: false; message: DraftMessage & { id: string } };
