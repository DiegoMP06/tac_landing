CREATE TYPE "public"."brands" AS ENUM('acu', 'acc', 'acm', 'default');--> statement-breakpoint
CREATE TYPE "public"."chat_status" AS ENUM('active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."leads_status" AS ENUM('pending', 'contacted', 'qualified', 'not_qualified');--> statement-breakpoint
CREATE TYPE "public"."locales" AS ENUM('es', 'en', 'pt');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" varchar(255),
	"client_ip" varchar(45),
	"user_agent" text,
	"locale" "locales",
	"status" "chat_status",
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" "brands" NOT NULL,
	"namespace" varchar(100),
	"key" varchar(255),
	"locale" "locales",
	"content" text,
	"embedding" vector(768),
	"content_hash" char(64),
	"dimensions" integer DEFAULT 768,
	"cache_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "embeddings_brand_namespace_key_locale_idx" UNIQUE("brand","namespace","key","locale")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"detected_intent" varchar(100),
	"status" "leads_status",
	"conversation_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "leads_conversation_id_unique" UNIQUE("conversation_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "message_role",
	"content" text,
	"tokens_used" json,
	"conversation_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "translation_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" "brands" NOT NULL,
	"namespace" varchar(100),
	"key" varchar(255),
	"locale" "locales",
	"original_text" json,
	"translated_text" json,
	"provider" varchar(50),
	"hash" char(64),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "translation_cache_brand_namespace_key_locale_idx" UNIQUE("brand","namespace","key","locale")
);
--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_cache_id_translation_cache_id_fk" FOREIGN KEY ("cache_id") REFERENCES "public"."translation_cache"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;