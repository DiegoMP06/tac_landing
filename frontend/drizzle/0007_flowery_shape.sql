ALTER TABLE "embeddings" ALTER COLUMN "embedding" SET DATA TYPE vector(3072);--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "dimensions" SET DEFAULT 3072;