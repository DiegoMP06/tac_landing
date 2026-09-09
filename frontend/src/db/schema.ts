import { BrandsEnum } from "@/enums";
import {
    ChatStatusEnum,
    LeadsStatusEnum,
    LeadTypeEnum,
    MessageRoleEnum,
} from "@/enums/chat";
import { LocalesEnum } from "@/enums/locale";
import { relations } from "drizzle-orm";
import {
    char,
    integer,
    json,
    pgEnum,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
    varchar,
    vector,
} from "drizzle-orm/pg-core";

export const brandsEnum = pgEnum("brands", BrandsEnum);
export const localesEnum = pgEnum("locales", LocalesEnum);
export const chatStatusEnum = pgEnum("chat_status", ChatStatusEnum);
export const messageRoleEnum = pgEnum("message_role", MessageRoleEnum);
export const leadsStatusEnum = pgEnum("leads_status", LeadsStatusEnum);
export const leadTypeEnum = pgEnum("lead_type", LeadTypeEnum);

export const translationCache = pgTable(
    "translation_cache",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        brand: brandsEnum("brand").notNull(),
        namespace: varchar("namespace", { length: 100 }).notNull(),
        key: varchar("key", { length: 255 }).notNull(),
        locale: localesEnum("locale").notNull(),
        originalText: json("original_text").notNull(),
        translatedText: json("translated_text").notNull(),
        provider: varchar("provider", { length: 50 }).notNull(),
        hash: char("hash", { length: 64 }).notNull(),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        unique("translation_cache_brand_namespace_key_locale_idx").on(
            table.brand,
            table.namespace,
            table.key,
            table.locale,
        ),
    ],
);

export const embeddings = pgTable("embeddings", {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 3072 }).notNull(),
    contentHash: char("content_hash", { length: 64 }).notNull(),
    dimensions: integer("dimensions").default(3072).notNull(),
    cacheId: uuid("cache_id")
        .references(() => translationCache.id, { onDelete: "cascade" })
        .notNull()
        .unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdateFn(() => new Date()),
});

export const conversations = pgTable("conversations", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionToken: varchar("session_token", { length: 255 }).notNull(),
    clientIp: varchar("client_ip", { length: 45 }).notNull(),
    userAgent: text("user_agent"),
    locale: localesEnum("locale").notNull(),
    status: chatStatusEnum("status").default(ChatStatusEnum.ACTIVE).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdateFn(() => new Date()),
});

export const messages = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    subject: text("subject"),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    tokensUsed: json("tokens_used"),
    createdAt: timestamp("created_at").defaultNow(),
    conversationId: uuid("conversation_id")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),
});

export const leads = pgTable(
    "leads",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull(),
        phone: varchar("phone", { length: 50 }).notNull(),
        company: varchar("company", { length: 255 }),
        type: leadTypeEnum("type").notNull().default(LeadTypeEnum.EMAIL),
        status: leadsStatusEnum("status")
            .default(LeadsStatusEnum.PENDING)
            .notNull(),
        customData: json("custom_data"),
        conversationId: uuid("conversation_id")
            .unique()
            .references(() => conversations.id, { onDelete: "set null" }),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
    },
    (table) => [
        unique("leads_email_phone_conversation_id_idx").on(
            table.email,
            table.phone,
            table.conversationId,
        ),
    ],
);

export const translationCacheRelations = relations(
    translationCache,
    ({ one }) => ({
        embedding: one(embeddings, {
            fields: [translationCache.id],
            references: [embeddings.cacheId],
        }),
    }),
);

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
    translationCache: one(translationCache, {
        fields: [embeddings.cacheId],
        references: [translationCache.id],
    }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
    messages: many(messages),
    lead: many(leads),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
    conversation: one(conversations, {
        fields: [leads.conversationId],
        references: [conversations.id],
    }),
}));
