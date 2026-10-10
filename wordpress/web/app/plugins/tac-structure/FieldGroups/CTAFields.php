<?php

namespace TAC\Structure\FieldGroups;

class CTAFields
{
    public static function register()
    {
        acf_add_local_field_group([
            'key' => 'group_cta',
            'title' => 'CTA de la Entidad',
            'show_in_rest' => 1,
            'fields' => [
                self::group(),
            ],
            'location' => [
                [
                    ['param' => 'post_type', 'operator' => '==', 'value' => 'program'],
                ],
                [
                    ['param' => 'post_type', 'operator' => '==', 'value' => 'event'],
                ],
                [
                    ['param' => 'post_type', 'operator' => '==', 'value' => 'page'],
                ],
            ],
        ]);
    }

    private static function group()
    {
        return  [
            'key' => 'group_entity_cta',
            'label' => 'CTA',
            'name' => 'cta',
            'type' => 'group',
            'layout' => 'block',
            'sub_fields'    => [
                self::titleField(),
                self::descriptionField(),
                self::redirectTextField(),
                self::redirectURLField(),
                self::secondaryRedirectTextField(),
                self::secondaryRedirectURLField(),
                self::imageField(),
            ],
        ];
    }

    private static function titleField()
    {
        return [
            'key'   => 'field_cta_title',
            'label' => 'Titulo',
            'name'  => 'title',
            'type'  => 'text',
            'required' => 1,
        ];
    }

    private static function descriptionField()
    {
        return [
            'key'   => 'field_cta_description',
            'label' => 'Descripción',
            'name'  => 'description',
            'type'  => 'textarea',
            'required' => 1,
        ];
    }

    private static function redirectTextField()
    {
        return [
            'key'   => 'field_cta_redirect_text',
            'label' => 'Texto del Boton de Redirección',
            'name'  => 'redirect_text',
            'type'  => 'text',
            'required' => 1,
        ];
    }

    private static function redirectURLField()
    {
        return [
            'key'   => 'field_cta_redirect_url',
            'label' => 'URL de Redirección',
            'name'  => 'redirect_url',
            'type'  => 'url',
            'required' => 1,
        ];
    }

    private static function secondaryRedirectTextField()
    {
        return [
            'key'   => 'field_cta_secondary_redirect_text',
            'label' => 'Texto del Boton de Redirección Secundario',
            'name'  => 'secondary_redirect_text',
            'type'  => 'text',
        ];
    }

    private static function secondaryRedirectURLField()
    {
        return [
            'key'   => 'field_cta_secondary_redirect_url',
            'label' => 'URL de Redirección Secundaria',
            'name'  => 'secondary_redirect_url',
            'type'  => 'url',
        ];
    }

    private static function imageField()
    {
        return [
            'key'   => 'field_cta_hero_image',
            'label' => 'Imagen del CTA',
            'name'  => 'hero_image',
            'type'  => 'image',
            'required' => 1,
        ];;
    }
}
