<?php

namespace TAC\Structure\FieldGroups\Partials;

class SpeakersRepeater
{
    public static function field(string $key_prefix): array
    {
        return [
            'key'   => "field_{$key_prefix}_speakers",
            'label' => 'Speakers',
            'name'  => 'speakers',
            'type'  => 'tac_repeater',
            'cols'  => [
                [
                    'label' => 'Nombre',
                    'name'  => 'name',
                    'type'  => 'text',
                ],
                [
                    'label' => 'Puesto',
                    'name'  => 'position',
                    'type'  => 'text',
                ],
                [
                    'label' => 'Organización',
                    'name'  => 'organization',
                    'type'  => 'text',
                ],
                [
                    'label' => 'LinkedIn',
                    'name'  => 'linkedin',
                    'type'  => 'url',
                ],
                [
                    'label' => 'Foto',
                    'name'  => 'photo',
                    'type'  => 'image',
                ],
            ],
        ];
    }
}
