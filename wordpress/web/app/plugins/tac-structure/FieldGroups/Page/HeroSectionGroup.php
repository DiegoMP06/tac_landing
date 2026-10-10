<?php

namespace TAC\Structure\FieldGroups\Page;

class HeroSectionGroup
{
    public static function group()
    {
        return [
            'key' => 'group_hero_page',
            'label' => 'Sección Hero',
            'name' => 'hero',
            'type' => 'group',
            'layout' => 'block',
            'sub_fields'    => [
                self::subtitleField(),
                self::descriptionField(),
                self::redirectTextField(),
                self::redirectUrlField(),
                self::secondaryRedirectTextField(),
                self::secondaryRedirectUrlField(),
            ],
        ];
    }

    private static function subtitleField()
    {
        return [
            'key'      => 'field_page_hero_subtitle',
            'label'    => 'Subtítulo',
            'name'     => 'subtitle',
            'type'     => 'text',
            'required' => 1,
        ];
    }

    private static function descriptionField()
    {
        return [
            'key'   => 'field_page_hero_description',
            'label' => 'Descripción',
            'name'  => 'description',
            'type'  => 'textarea',
            'required' => 1,
        ];
    }

    private static function redirectTextField()
    {
        return [
            'key'   => 'field_page_hero_redirect_text',
            'label' => 'Texto del Botón de Redirección',
            'name'  => 'redirect_text',
            'type'  => 'text',
        ];
    }

    private static function redirectUrlField()
    {
        return [
            'key'   => 'field_page_hero_redirect_url',
            'label' => 'Url de Redirección',
            'name'  => 'redirect_url',
            'type'  => 'text',
        ];
    }

    private static function secondaryRedirectTextField()
    {
        return [
            'key'   => 'field_page_hero_secondary_redirect_text',
            'label' => 'Texto del Botón de Redirección Secundaria',
            'name'  => 'secondary_redirect_text',
            'type'  => 'text',
        ];
    }

    private static function secondaryRedirectUrlField()
    {
        return [
            'key'   => 'field_page_hero_secondary_redirect_url',
            'label' => 'Url de Redirección Secundaria',
            'name'  => 'secondary_redirect_url',
            'type'  => 'text',
        ];
    }
}
