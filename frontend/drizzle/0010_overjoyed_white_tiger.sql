CREATE TYPE "public"."channel" AS ENUM('web', 'whatsapp', 'telegram', 'email');--> statement-breakpoint
CREATE TABLE "telegram_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_telegram_message_id" bigint NOT NULL,
	"conversation_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "telegram_mappings_staff_telegram_message_id_unique" UNIQUE("staff_telegram_message_id")
);
--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "session_token" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "client_ip" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "channel" "channel" DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "phone" varchar(50);--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "telegram_chat_id" bigint;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "bot_paused" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "paused_at" timestamp;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "telegram_username" varchar(255);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "company" varchar(255);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "custom_data" json;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "external_message_id" varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "subject" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "metadata" json;--> statement-breakpoint
ALTER TABLE "telegram_mappings" ADD CONSTRAINT "telegram_mappings_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_external_message_id_unique" UNIQUE("external_message_id");