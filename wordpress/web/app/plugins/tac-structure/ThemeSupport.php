<?php

namespace TAC\Structure;

class ThemeSupport
{
    public static function register()
    {
        add_theme_support('post-thumbnails', ['program', 'event', 'page', 'post']);
    }
}
