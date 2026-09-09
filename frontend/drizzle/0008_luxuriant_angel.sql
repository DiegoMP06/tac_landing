ALTER TABLE "conversations" ALTER COLUMN "session_token" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "client_ip" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "locale" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "status" SET NOT NULL;