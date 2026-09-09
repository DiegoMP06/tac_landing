<?php

/**
 * Plugin Name: Global Development Helpers
 * Description: Funciones globales de depuración para el entorno de desarrollo.
 * Author: Diego
 */

if (!function_exists('dd')) {
    function dd(mixed ...$vars)
    {
        if (!headers_sent()) {
            header('HTTP/1.1 500 Internal Server Error');
        }

        foreach ($vars as $v) {
            Symfony\Component\VarDumper\VarDumper::dump($v);
        }

        exit(1);
    }
}
// dd(network_admin_url(''));

