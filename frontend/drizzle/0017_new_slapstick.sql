ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "leads" CASCADE;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "session_token" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "client_ip" SET NOT NULL;--> statement-breakpoint
DROP TYPE "public"."lead_type";--> statement-breakpoint
DROP TYPE "public"."leads_status";