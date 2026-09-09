ALTER TABLE "embeddings" DROP CONSTRAINT "embeddings_brand_namespace_key_locale_idx";--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "embedding" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "content_hash" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "cache_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "translation_cache" ALTER COLUMN "namespace" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "translation_cache" ALTER COLUMN "key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "translation_cache" ALTER COLUMN "locale" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "translation_cache" ALTER COLUMN "original_text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "translation_cache" ALTER COLUMN "translated_text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "translation_cache" ALTER COLUMN "provider" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "translation_cache" ALTER COLUMN "hash" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" DROP COLUMN "brand";--> statement-breakpoint
ALTER TABLE "embeddings" DROP COLUMN "namespace";--> statement-breakpoint
ALTER TABLE "embeddings" DROP COLUMN "key";--> statement-breakpoint
ALTER TABLE "embeddings" DROP COLUMN "locale";--> statement-breakpoint
ALTER TABLE "embeddings" DROP COLUMN "dimensions";--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_cache_id_idx" UNIQUE("cache_id");