<?php

namespace TAC\Structure\Filters;

class ACFJsonFilters
{
    public static function register(): void
    {
        add_filter('acf/settings/save_json', [self::class, 'setSavePath']);
        add_filter('acf/settings/load_json', [self::class, 'setLoadPath']);
    }

    public static function setSavePath(string $path): string
    {
        return dirname(__DIR__, 2) . '/acf-json';
    }

    public static function setLoadPath(array $paths): array
    {
        unset($paths[0]);
        $paths[] = dirname(__DIR__, 2) . '/acf-json';
        return $paths;
    }
}
