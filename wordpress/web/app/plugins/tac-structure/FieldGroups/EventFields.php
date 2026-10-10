<?php

namespace TAC\Structure\FieldGroups;

use TAC\Structure\FieldGroups\Partials\SpeakersRepeater;
use TAC\Structure\FieldGroups\Partials\TitleDescriptionIconRepeater;

class EventFields
{
    public static function register(): void
    {
        acf_add_local_field_group([
            'key'      => 'group_event',
            'title'    => 'Detalles del Evento',
            'show_in_rest' => 1,
            'fields'   => [
                self::subtitleField(),
                self::descriptionField(),
                self::startDateField(),
                self::endDateField(),
                self::featuredField(),
                self::modalityField(),
                self::onlineLinkField(),
                self::locationField(),
                SpeakersRepeater::field('event'),
                TitleDescriptionIconRepeater::field('event', 'highlights', 'Puntos Destacados'),
            ],
            'location' => [
                [
                    [
                        'param'    => 'post_type',
                        'operator' => '==',
                        'value'    => 'event',
                    ],
                ],
            ],
        ]);
    }

    private static function subtitleField()
    {
        return [
            'key'   => 'field_event_subtitle',
            'label' => 'Subtitulo',
            'name'  => 'subtitle',
            'type'  => 'text',
            'required' => 1,
        ];
    }

    private static function descriptionField()
    {
        return [
            'key'   => 'field_event_description',
            'label' => 'Descripción',
            'name'  => 'description',
            'type'  => 'textarea',
            'required' => 1,
        ];
    }

    private static function startDateField()
    {
        return [
            'key'               => 'field_event_start_date',
            'label'             => 'Fecha de inicio',
            'name'              => 'start_date',
            'type'              => 'date_picker',
            'required'          => 1,
        ];
    }

    private static function endDateField()
    {
        return [
            'key'               => 'field_event_end_date',
            'label'             => 'Fecha de fin',
            'name'              => 'end_date',
            'type'              => 'date_picker',
            'required'          => 1,
        ];
    }

    private static function featuredField()
    {
        return [
            'key'   => 'field_event_featured',
            'label' => '¿Es Destacado?',
            'name'  => 'featured',
            'type'  => 'true_false',
        ];
    }


    private static function modalityField()
    {
        return [
            'key'           => 'field_event_modality',
            'label'         => 'Modalidad',
            'name'          => 'modality',
            'type'          => 'select',
            'required'      => 1,
            'choices'       => [
                'in_person'          => 'Presencial',
                'hybrid'    => 'Hibrido',
                'online'  => 'En linea',
            ],
            'default_value' => 'in_person',
            'allow_null'    => 0,
            'multiple'      => 0,
        ];
    }

    private static function onlineLinkField()
    {
        return [
            'key'               => 'field_event_online_link',
            'label'             => 'Enlace del eventa',
            'name'              => 'online_link',
            'type'              => 'url',
            'required'          => 1,
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_event_modality',
                        'operator' => '==',
                        'value'    => 'online',
                    ],
                ],
            ],
        ];
    }
    private static function locationField()
    {
        return [
            'key'               => 'field_event_location',
            'label'             => 'Ubicación',
            'name'              => 'location',
            'type'              => 'open_street_map',
            'required'          => 1,
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_event_modality',
                        'operator' => '!=',
                        'value'    => 'online',
                    ],
                ],
            ],
        ];
    }
}
