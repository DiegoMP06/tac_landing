<?php

namespace TAC\Structure\Helpers;

class SiteFormatter
{
    public static function current(): array
    {
        $blog_id = get_current_blog_id();

        $details = function_exists('get_blog_details')
            ? get_blog_details($blog_id)
            : null;

        $variant = str_replace("/", "", $details->path) ?? null;
        $variant = !$variant ? 'default' : $variant;

        return [
            'id'     => $blog_id,
            'name'   => $details->blogname ?? get_bloginfo('name'),
            'url'    => $details->siteurl ?? home_url(),
            'domain' => $details->domain ?? null,
            'variant'   => $variant,
        ];
    }
}
