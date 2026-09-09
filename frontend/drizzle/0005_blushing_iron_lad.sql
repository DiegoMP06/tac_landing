ALTER TABLE "embeddings" DROP CONSTRAINT "embeddings_cache_id_idx";--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_cache_id_unique" UNIQUE("cache_id");