<?php

namespace TAC\Structure\FieldGroups;

use TAC\Structure\FieldGroups\CTAFields;
use TAC\Structure\FieldGroups\ProgramFields;
use TAC\Structure\FieldGroups\EventFields;
use TAC\Structure\FieldGroups\PageFields;

class FieldGroups
{
    public static function register()
    {
        if (!function_exists('acf_add_local_field_group')) return;

        PageFields::register();
        ProgramFields::register();
        EventFields::register();
        PostFields::register();
        CTAFields::register();
    }
}
