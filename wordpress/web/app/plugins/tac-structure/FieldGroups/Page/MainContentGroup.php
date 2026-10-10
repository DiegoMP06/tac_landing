<?php

namespace TAC\Structure\FieldGroups\Page;

class MainContentGroup
{
    public static function group()
    {
        return [
            'key'      => 'group_content_page',
            'label'    => 'Contenido Principal de la Página',
            'name' => 'content',
            'type' => 'group',
            'layout' => 'block',
            'sub_fields'   => [
                self::titleField(),
                self::subtitleField(),
                self::phraseField(),
            ],
        ];
    }



    private static function titleField()
    {
        return [
            'key'      => 'field_content_page_title',
            'label'    => 'Título',
            'name'     => 'title',
            'type'     => 'text',
            'required' => 1,
        ];
    }

    private static function subtitleField()
    {
        return [
            'key'      => 'field_content_page_subtitle',
            'label'    => 'Subtítulo',
            'name'     => 'subtitle',
            'type'     => 'text',
            'required' => 1,
        ];
    }

    private static function phraseField()
    {
        return [
            'key'      => 'field_content_page_phrase',
            'label'    => 'Frase',
            'name'     => 'phrase',
            'type'     => 'text',
            'required' => 1,
        ];
    }
}
