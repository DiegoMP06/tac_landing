<?php

namespace TAC\Structure\Helpers;

class LocationFormatter
{
    public static function fromAcfOpenStreetMap($raw): ?array
    {
        if (empty($raw) || !is_array($raw)) {
            return null;
        }

        return [
            'lat'     => isset($raw['lat']) ? (float) $raw['lat'] : null,
            'lng'     => isset($raw['lng']) ? (float) $raw['lng'] : null,
            'zoom'    => isset($raw['zoom']) ? (int) $raw['zoom'] : null,
            'address' => $raw['address'] ?? null,
            'markers' => self::formatMarkers($raw['markers'] ?? []),
        ];
    }

    private static function formatMarkers($markers): array
    {
        if (!is_array($markers)) {
            return [];
        }

        return array_values(array_map(function ($marker) {
            return [
                'label' => $marker['label'] ?? ($marker['default_label'] ?? null),
                'lat'   => isset($marker['lat']) ? (float) $marker['lat'] : null,
                'lng'   => isset($marker['lng']) ? (float) $marker['lng'] : null,
            ];
        }, $markers));
    }
}
