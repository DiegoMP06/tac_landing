<?php

namespace TAC\Structure\Helpers;

use DateTime;

class DateFormatter
{
    public static function fromAcfDatePicker(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        if (!preg_match('/^\d{8}$/', $value)) {
            return $value;
        }

        $date = DateTime::createFromFormat('Ymd', $value);

        if ($date === false) {
            return $value;
        }

        return $date->format('d/m/Y');
    }
}
