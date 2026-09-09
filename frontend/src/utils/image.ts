import type {
    FeaturedImageAtt,
    FeaturedImages,
    FeaturedImageSizes,
} from "@/types/images";

export function useFeaturedImage(
    image: FeaturedImages & { is_svg: true },
): () => string;

export function useFeaturedImage(
    image: (FeaturedImages & { is_svg: false }) | null | undefined,
): (size?: FeaturedImageSizes) => FeaturedImageAtt | null;

export function useFeaturedImage(image: null | undefined): () => null;

export function useFeaturedImage(
    image: FeaturedImages | null | undefined,
):
    | ((size?: FeaturedImageSizes) => FeaturedImageAtt | null)
    | (() => string)
    | (() => null);

export function useFeaturedImage(
    image: FeaturedImages | null | undefined,
):
    | ((size?: FeaturedImageSizes) => FeaturedImageAtt | null)
    | (() => string)
    | (() => null) {
    if (!image) return () => null;

    if (image.is_svg) {
        return () => image.content;
    }

    return  (size: FeaturedImageSizes = "full") =>
              image.sizes?.[size] ||
              image.sizes?.full ||
              image.sizes?.large ||
              image.sizes?.medium ||
              image.sizes?.medium_large ||
              image.sizes?.thumbnail ||
              null
}
