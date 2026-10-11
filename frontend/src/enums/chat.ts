export const ChatStatusEnum = {
    ACTIVE: "active",
    CLOSED: "closed",
} as const;

export const MessageRoleEnum = {
    USER: "user",
    ASSISTANT: "assistant",
    SYSTEM: "system",
    AGENT: "agent",
} as const;

export const EmbedTaskTypeEnum = {
    QUERY: "query",
    DOCUMENT: "document",
} as const;

export const ChatModeEnum = {
    CHAT: "chat",
    CONTACT: "contact",
} as const;

export const ResponseFormatEnum = {
    JSON_OBJECT: "json_object",
    TEXT: "text",
} as const;
