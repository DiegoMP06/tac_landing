<?php

/**
 * Plugin Name: The Americas Conference Structure
 * Description: Main architectural structure, Custom Post Types, and REST API extensions for TAC sites.
 * Version:     1.0.0
 * Author:      Diego Meneses Pérez
 */

if (!defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/vendor/autoload.php';

use TAC\Structure\FieldGroups\FieldGroups;
use TAC\Structure\Fields\Repeater;
use TAC\Structure\Filters\ACFJsonFilters;
use TAC\Structure\Filters\RestQueryFilters;
use TAC\Structure\PostTypes;
use TAC\Structure\RestFields\RestFields;
use TAC\Structure\ThemeSupport;

Repeater::register_hooks();
ACFJsonFilters::register();

add_action('acf/init', [FieldGroups::class, 'register']);
add_action('after_setup_theme', [ThemeSupport::class, 'register']);
add_action('init', [PostTypes::class, 'register']);
add_action('rest_api_init', [RestFields::class, 'register']);
add_action('rest_api_init', [RestQueryFilters::class, 'register']);
