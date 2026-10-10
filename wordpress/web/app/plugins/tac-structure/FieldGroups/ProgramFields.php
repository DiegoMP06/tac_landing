<?php

namespace TAC\Structure\FieldGroups;

use TAC\Structure\FieldGroups\Partials\TitleDescriptionIconRepeater;

class ProgramFields
{
    public static function register(): void
    {
        acf_add_local_field_group([
            'key'      => 'group_program',
            'title'    => 'Detalles del Programa',
            'show_in_rest' => 1,
            'fields'   => [
                self::subtitleField(),
                self::descriptionField(),
                self::targetAudienceField(),
                self::durationTypeField(),
                self::startDateField(),
                self::endDateField(),
                self::durationPerMonthsField(),
                self::durationPerWeeksField(),
                self::featuredField(),
                self::modalityField(),
                self::onlineLinkField(),
                self::locationField(),
                TitleDescriptionIconRepeater::field('program', 'highlights', 'Puntos Destacados'),
                TitleDescriptionIconRepeater::field('program', 'benefits', 'Beneficios'),
            ],
            'location' => [
                [
                    [
                        'param'    => 'post_type',
                        'operator' => '==',
                        'value'    => 'program',
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

    private static function targetAudienceField()
    {
        return [
            'key'   => 'field_program_target_audience',
            'label' => 'Audiencia dirigida',
            'name'  => 'target_audience',
            'type'  => 'text',
            'required' => 1,
        ];
    }

    private static function durationTypeField()
    {
        return [
            'key'           => 'field_program_duration_type',
            'label'         => 'Tipo de Duración',
            'name'          => 'duration_type',
            'type'          => 'select',
            'required'      => 1,
            'choices'       => [
                'fixed_dates'          => 'Fechas fijas',
                'duration_per_week'    => 'Duración por Semanas',
                'duration_per_months'  => 'Duración por Meses',
            ],
            'default_value' => 'fixed_dates',
            'allow_null'    => 0,
            'multiple'      => 0,
        ];
    }

    private static function startDateField()
    {
        return [
            'key'               => 'field_program_start_date',
            'label'             => 'Fecha de inicio',
            'name'              => 'start_date',
            'type'              => 'date_picker',
            'required'          => 1,
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_program_duration_type',
                        'operator' => '==',
                        'value'    => 'fixed_dates',
                    ],
                ],
            ],
        ];
    }

    private static function endDateField()
    {
        return [
            'key'               => 'field_program_end_date',
            'label'             => 'Fecha de fin',
            'name'              => 'end_date',
            'type'              => 'date_picker',
            'required'          => 1,
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_program_duration_type',
                        'operator' => '==',
                        'value'    => 'fixed_dates',
                    ],
                ],
            ],
        ];
    }

    private static function durationPerMonthsField()
    {
        return [
            'key'               => 'field_program_duration_per_months',
            'label'             => 'Duración por Meses',
            'name'              => 'duration_per_months',
            'type'              => 'number',
            'required'          => 1,
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_program_duration_type',
                        'operator' => '==',
                        'value'    => 'duration_per_months',
                    ],
                ],
            ],
        ];
    }

    private static function durationPerWeeksField()
    {
        return [
            'key'               => 'field_program_duration_per_weeks',
            'label'             => 'Duración por Semanas',
            'name'              => 'duration_per_weeks',
            'type'              => 'number',
            'required'          => 1,
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_program_duration_type',
                        'operator' => '==',
                        'value'    => 'duration_per_week',
                    ],
                ],
            ],
        ];
    }


    private static function featuredField()
    {
        return [
            'key'   => 'field_program_featured',
            'label' => '¿Es Destacado?',
            'name'  => 'featured',
            'type'  => 'true_false',
        ];
    }


    private static function modalityField()
    {
        return [
            'key'           => 'field_program_modality',
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
            'key'               => 'field_program_online_link',
            'label'             => 'Enlace del programa',
            'name'              => 'online_link',
            'type'              => 'url',
            'required'          => 1,
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_program_modality',
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
            'key'               => 'field_program_location',
            'label'             => 'Ubicación',
            'name'              => 'location',
            'type'              => 'open_street_map',
            'required'          => 1,
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_program_modality',
                        'operator' => '!=',
                        'value'    => 'online',
                    ],
                ],
            ],
        ];
    }
}
