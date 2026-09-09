CREATE TYPE "public"."lead_type" AS ENUM('email', 'whatsapp', 'telegram');--> statement-breakpoint
ALTER TABLE "telegram_mappings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "telegram_mappings" CASCADE;--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_external_message_id_unique";--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "type" "lead_type" DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "channel";--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "telegram_chat_id";--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "bot_paused";--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "paused_at";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "external_message_id";--> statement-breakpoint
DROP TYPE "public"."channel";