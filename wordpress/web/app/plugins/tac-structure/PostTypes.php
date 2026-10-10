<?php

namespace TAC\Structure;

class PostTypes
{
    public static function register()
    {
        self::registerEvent();
        self::registerProgram();
    }

    private static function registerProgram()
    {
        register_post_type('program', [
            'label'        => 'Programas',
            'labels'       => [
                'name'          => 'Programas',
                'singular_name' => 'Programa',
                'add_new_item'  => 'Añadir Programa',
                'edit_item'     => 'Editar Programa',
            ],
            'public'       => true,
            'show_in_rest' => true,
            'rest_base'    => 'programs',
            'supports'     => ['title', 'editor', 'thumbnail'],
            'has_archive'  => true,
            'menu_icon'    => 'dashicons-list-view',
            'rewrite'      => ['slug' => 'program'],
        ]);
    }

    private static function registerEvent()
    {
        register_post_type('event', [
            'label'        => 'Eventos',
            'labels'       => [
                'name'          => 'Eventos',
                'singular_name' => 'Evento',
                'add_new_item'  => 'Añadir Evento',
                'edit_item'     => 'Editar Evento',
            ],
            'public'       => true,
            'show_in_rest' => true,
            'rest_base'    => 'events',
            'supports'     => ['title', 'editor', 'thumbnail'],
            'has_archive'  => true,
            'menu_icon'    => 'dashicons-calendar-alt',
            'rewrite'      => ['slug' => 'event'],
        ]);
    }
}
