<?php

namespace TAC\Structure\Filters;

use TAC\Structure\Helpers\DateFormatter;
use TAC\Structure\Helpers\ImageFormatter;
use TAC\Structure\Helpers\LocationFormatter;

class RestQueryFilters
{
    private const POST_TYPES = ['program', 'event'];
    private const DEFAULT_FEATURED_LIMIT = 10;


    public static function register(): void
    {
        add_filter('acf/format_value/type=image', [self::class, 'filterACFImageFields'], 10, 3);
        add_filter('acf/format_value/type=date_picker', [self::class, 'filterACFDateFields'], 10, 3);
        add_filter('acf/format_value/type=open_street_map', [self::class, 'filterACFLocationFields'], 20, 3);

        foreach (self::POST_TYPES as $post_type) {
            add_filter("rest_{$post_type}_query", [self::class, 'filterByFeatured'], 10, 2);
        }
    }

    public static function filterByFeatured(array $args, \WP_REST_Request $request): array
    {
        if (!isset($request['featured'])) {
            return $args;
        }

        $args['meta_query'][] = [
            'key'     => 'featured',
            'value'   => $request['featured'],
            'compare' => '=',
        ];

        $args['orderby'] = 'date';
        $args['order']   = 'DESC';

        $limit = isset($request['limit']) && is_numeric($request['limit'])
            ? (int) $request['limit']
            : self::DEFAULT_FEATURED_LIMIT;

        $args['posts_per_page'] = max(1, $limit);

        return $args;
    }

    public static function filterACFImageFields($value, $post_id, $field)
    {
        $attachment_id = null;

        if (is_numeric($value) && (int) $value > 0) {
            $attachment_id = (int) $value;
        } elseif (is_array($value) && !empty($value['id'])) {
            $attachment_id = (int) $value['id'];
        }

        if ($attachment_id) {
            return ImageFormatter::allSizesById($attachment_id);
        }

        return null;
    }

    public static function filterACFDateFields($value, $post_id, $field)
    {
        return DateFormatter::fromAcfDatePicker($value);

        return $value;
    }

    public static function filterACFLocationFields($value, $post_id, $field)
    {
        $raw = get_field($field['name'], $post_id, false);

        return LocationFormatter::fromAcfOpenStreetMap($raw);
    }
}
