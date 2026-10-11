import { z } from "astro/zod";
import { ListPostsSchema, PostSchema, PostTranslationSchema } from "@/schemas/blog";

export type Post = z.infer<typeof PostSchema>;
export type ListPosts = z.infer<typeof ListPostsSchema>;
export type PostTranslation = z.infer<typeof PostTranslationSchema>;
