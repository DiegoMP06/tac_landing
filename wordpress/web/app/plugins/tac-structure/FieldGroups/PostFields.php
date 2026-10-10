<?php

namespace TAC\Structure\FieldGroups;

class PostFields
{
    public static function register(): void
    {
        acf_add_local_field_group([
            'key' => 'group_post',
            'title' => 'Detalles de la Publicación',
            'show_in_rest' => 1,
            'fields' => [
                self::subtitleField(),
                self::descriptionField(),
            ],
            'location' => [
                [
                    [
                        'param'    => 'post_type',
                        'operator' => '==',
                        'value'    => 'post',
                    ],
                ],
            ],
        ]);
    }

    private static function subtitleField()
    {
        return [
            'key'   => 'field_program_subtitle',
            'label' => 'Subtitulo',
            'name'  => 'subtitle',
            'type'  => 'text',
            'required' => 1,
        ];
    }

    private static function descriptionField()
    {
        return [
            'key'   => 'field_program_description',
            'label' => 'Descripción',
            'name'  => 'description',
            'type'  => 'textarea',
            'required' => 1,
        ];
    }
}
