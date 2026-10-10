<?php

namespace TAC\Structure\Helpers;

class ImageFormatter
{
    private const EXCLUDED_SIZES = ['1536x1536', '2048x2048'];

    public static function allSizesById(int $attachment_id): array|null
    {
        if ($attachment_id <= 0) {
            return null;
        }

        $mime_type = get_post_mime_type($attachment_id);

        if ($mime_type === 'image/svg+xml') {
            $url = wp_get_attachment_url($attachment_id);

            if (!$url) {
                return [];
            }

            $file_path = get_attached_file($attachment_id);
            $content   = ($file_path && file_exists($file_path))
                ? file_get_contents($file_path)
                : null;

            return [
                'is_svg'  => true,
                'full'    => [
                    'url'    => $url,
                    'width'  => null,
                    'height' => null,
                ],
                'content' => $content,
            ];
        }

        $sizes = get_intermediate_image_sizes();
        $sizes[] = 'full';

        $images = [];

        foreach ($sizes as $size) {
            if (in_array($size, self::EXCLUDED_SIZES, true)) {
                continue;
            }

            $image = wp_get_attachment_image_src($attachment_id, $size);

            if ($image) {
                $images[$size] = [
                    'url'    => $image[0],
                    'width'  => $image[1],
                    'height' => $image[2],
                ];
            }
        }

        return [
            'sizes' => $images,
            'is_svg' => false
        ];
    }

    public static function fromFeaturedMedia($post): ?array
    {
        $featured_media_id = is_array($post)
            ? ($post['featured_media'] ?? 0)
            : ($post->featured_media ?? 0);

        if (empty($featured_media_id)) {
            return null;
        }

        return self::allSizesById((int) $featured_media_id);
    }
}
