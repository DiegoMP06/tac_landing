ALTER TABLE "embeddings" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "dimensions" SET DEFAULT 1536;