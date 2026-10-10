<?php

namespace TAC\Structure\FieldGroups\Partials;

class TitleDescriptionIconRepeater
{
    public static function field(string $key_prefix, string $name, string $label): array
    {
        return [
            'key'   => "field_{$key_prefix}_{$name}",
            'label' => $label,
            'name'  => $name,
            'type'  => 'tac_repeater',
            'cols'  => [
                [
                    'label' => 'Título',
                    'name'  => 'title',
                    'type'  => 'text',
                ],
                [
                    'label' => 'Descripción',
                    'name'  => 'description',
                    'type'  => 'textarea',
                ],
                [
                    'label' => 'Ícono',
                    'name'  => 'icon',
                    'type'  => 'image',
                ],
            ],
        ];
    }
}
