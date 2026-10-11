import type { Post, PostTranslation } from "@/types/blog";

export function applyPostTranslation(
    post: Post,
    translation: PostTranslation,
): Post {
    return {
        ...post,
        ...translation,
        acf: {
            ...post.acf,
            ...translation.acf,
            cta: {
                ...post.acf.cta,
                ...translation.acf.cta,
            },
        },
    };
}
