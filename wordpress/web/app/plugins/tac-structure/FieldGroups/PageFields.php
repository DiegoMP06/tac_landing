<?php

namespace TAC\Structure\FieldGroups;

use TAC\Structure\FieldGroups\Page\HeroSectionGroup;
use TAC\Structure\FieldGroups\Page\MainContentGroup;

class PageFields
{
    public static function register(): void
    {
        acf_add_local_field_group([
            'key'      => 'group_page',
            'title'    => 'Detalles de la Pagina',
            'show_in_rest' => 1,
            'fields'   => [
                HeroSectionGroup::group(),
                MainContentGroup::group(),
            ],
            'location' => [
                [
                    [
                        'param'    => 'post_type',
                        'operator' => '==',
                        'value'    => 'page',
                    ],
                ],
            ],
        ]);
    }
}
