<?php

namespace TAC\Structure\RestFields;

use TAC\Structure\Helpers\ImageFormatter;
use TAC\Structure\Helpers\SiteFormatter;

class RestFields
{
    public static function register(): void
    {
        self::registerSharedFields();
    }

    private static function registerSharedFields(): void
    {
        register_rest_field(
            ['page', 'program', 'event', 'post'],
            'images',
            [
                'get_callback' => ImageFormatter::fromFeaturedMedia(...),
                'schema'       => null,
            ]
        );

        register_rest_field(
            ['page', 'program', 'event', 'post'],
            'acf',
            [
                'get_callback' => [self::class, 'getAcfFields'],
                'schema'       => null,
            ]
        );

        register_rest_field(
            ['page', 'program', 'event', 'post'],
            'site',
            [
                'get_callback' => SiteFormatter::current(...),
                'schema'       => null,
            ]
        );
    }

    public static function getAcfFields($post, $field_name, $request)
    {
        $post_id = isset($post['id']) ? (int) $post['id'] : (int) $request['id'];

        if (! $post_id) {
            return new \stdClass();
        }

        $post_obj = get_post($post_id);

        global $post;
        $previous_global_post = $post;

        if ($post_obj) {
            setup_postdata($post_obj);
        }

        $fields = get_fields($post_id, true);

        $post = $previous_global_post;
        wp_reset_postdata();

        return $fields ?: new \stdClass();
    }
}
