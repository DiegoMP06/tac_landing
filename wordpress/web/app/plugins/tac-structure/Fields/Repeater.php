<?php

namespace TAC\Structure\Fields;

use TAC\Structure\Helpers\ImageFormatter;

if (! class_exists('acf_field')) {
    return;
}

class Repeater extends \acf_field
{
    public function __construct()
    {
        $this->name     = 'tac_repeater';
        $this->label    = __('Repetidor Personalizado', 'tac-structure');
        $this->category = 'layout';
        $this->defaults = [
            'cols' => [],
        ];

        parent::__construct();
    }

    public static function register_hooks(): void
    {
        add_action('acf/include_field_types', function () {
            acf_register_field_type(self::class);
        });

        add_action('acf/field_group/admin_enqueue_scripts', [self::class, 'enqueue_field_settings_assets']);
    }

    public static function enqueue_field_settings_assets(): void
    {
        if (! wp_script_is('tac-repeater-field-settings-js', 'enqueued')) {
            wp_enqueue_script(
                'tac-repeater-field-settings-js',
                self::assets_url() . 'field-settings.js',
                ['jquery'],
                '2.1.1',
                true
            );
        }

        if (! wp_style_is('tac-repeater-field-settings-css', 'enqueued')) {
            wp_enqueue_style(
                'tac-repeater-field-settings-css',
                self::assets_url() . 'field-settings.css',
                [],
                '2.1.1'
            );
        }
    }

    private static function assets_url(): string
    {
        return plugin_dir_url(__FILE__) . 'assets/';
    }

    public function input_admin_enqueue_scripts()
    {
        wp_enqueue_media();

        wp_enqueue_editor();

        wp_enqueue_script(
            'tac-repeater-js',
            self::assets_url() . 'repeater.js',
            ['jquery'],
            '2.1.1',
            true
        );

        wp_enqueue_style(
            'tac-repeater-css',
            self::assets_url() . 'repeater.css',
            [],
            '2.1.1'
        );
    }

    private function get_supported_subfield_types()
    {
        return [
            'text'     => __('Texto', 'tac-structure'),
            'textarea' => __('Área de Texto', 'tac-structure'),
            'number'   => __('Número', 'tac-structure'),
            'url'      => __('URL', 'tac-structure'),
            'email'    => __('Email', 'tac-structure'),
            'image'    => __('Imagen (ID adjunto)', 'tac-structure'),
            'wysiwyg'  => __('Texto enriquecido (WordPress)', 'tac-structure'),
        ];
    }

    public function load_field($field)
    {
        $raw = $field['cols'] ?? [];

        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            $raw = is_array($decoded) ? $decoded : [];
        }

        if (! is_array($raw)) {
            $raw = [];
        }

        $clean = [];

        foreach ($raw as $sf) {
            if (! is_array($sf)) {
                continue;
            }

            $label = isset($sf['label']) ? trim((string) $sf['label']) : '';
            $name  = isset($sf['name']) ? trim((string) $sf['name']) : '';
            $type  = isset($sf['type']) ? trim((string) $sf['type']) : 'text';

            if (empty($name) && ! empty($label)) {
                $name = str_replace('-', '_', sanitize_title($label));
            }

            if (empty($name)) {
                continue;
            }

            $clean[] = [
                'label' => $label !== '' ? $label : $name,
                'name'  => $name,
                'type'  => $type !== '' ? $type : 'text',
            ];
        }

        $field['cols'] = $clean;

        return $field;
    }

    public function render_field_settings($field)
    {
        $columns = (! empty($field['cols']) && is_array($field['cols']))
            ? $field['cols']
            : [];

        $json_wrapper_id = 'custom-repeater-cols-json-' . $field['key'];

        $field_for_setting = $field;
        $field_for_setting['cols'] = wp_json_encode($columns);

        acf_render_field_setting(
            $field_for_setting,
            array(
                'label'        => __('Sub Campos (JSON interno)', 'tac-structure'),
                'instructions' => __('No edites este cuadro directamente. Usa la interfaz de abajo.', 'tac-structure'),
                'type'         => 'textarea',
                'name'         => 'cols',
                'class'        => 'custom-repeater-cols-json',
                'wrapper'      => array(
                    'id'    => $json_wrapper_id,
                    'class' => 'custom-repeater-cols-json-wrapper',
                ),
            )
        );
?>

        <div class="acf-field acf-field-setting-cols-ui" data-name="cols_ui">
            <div class="acf-label">
                <label>
                    <?php _e('Sub Campos', 'tac-structure'); ?>
                </label>
                <p class="description">
                    <?php _e('Define los campos que tendrá cada fila del repetidor. Si dejas vacío el "Nombre (slug)", se genera automáticamente a partir de la Etiqueta.', 'tac-structure'); ?>
                </p>
            </div>

            <div class="acf-input">
                <div
                    class="custom-repeater-subfields-wrapper"
                    data-field-key="<?= esc_attr($field['key']); ?>"
                    data-json-wrapper-id="<?= esc_attr($json_wrapper_id); ?>">

                    <table class="acf-table custom-repeater-subfields-table">
                        <thead>
                            <tr>
                                <th><?php _e('Etiqueta', 'tac-structure'); ?></th>
                                <th><?php _e('Nombre (slug)', 'tac-structure'); ?></th>
                                <th><?php _e('Tipo', 'tac-structure'); ?></th>
                                <th class="acf-row-handle remove"></th>
                            </tr>
                        </thead>

                        <tbody class="subfields-rows">
                            <?php
                            foreach ($columns as $i => $sub) {
                                $this->render_subfield_setting_row($i, $sub);
                            }
                            ?>
                        </tbody>
                    </table>

                    <a href="#" class="acf-button button add-subfield-row">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                        <?php _e('Añadir Sub Campo', 'tac-structure'); ?>
                    </a>

                    <script type="text/html" class="subfield-row-template">
                        <?php $this->render_subfield_setting_row('__INDEX__'); ?>
                    </script>
                </div>
            </div>
        </div>
    <?php
    }

    private function render_subfield_setting_row($index, $sub = [])
    {
        $label = $sub['label'] ?? '';
        $name  = $sub['name'] ?? '';
        $type  = $sub['type'] ?? 'text'; ?>

        <tr class="subfield-row" data-index="<?= esc_attr($index); ?>">
            <td>
                <input type="text" class="widefat sub-label-input" value="<?= esc_attr($label); ?>" />
            </td>

            <td>
                <input
                    type="text"
                    class="widefat sub-name-input"
                    value="<?= esc_attr($name); ?>"
                    data-user-edited="<?= $name !== '' ? '1' : '0'; ?>"
                    placeholder="<?php esc_attr_e('Se genera automáticamente', 'tac-structure'); ?>" />
            </td>

            <td>
                <select class="widefat sub-type-select">
                    <?php foreach ($this->get_supported_subfield_types() as $type_key => $type_label) : ?>
                        <option value="<?= esc_attr($type_key); ?>" <?php selected($type, $type_key); ?>>
                            <?= esc_html($type_label); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </td>
            <td class="acf-row-handle remove">
                <a href="#" class="remove-subfield-row" title="<?php _e('Eliminar', 'tac-structure'); ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus-icon lucide-minus">
                        <path d="M5 12h14" />
                    </svg>
                </a>
            </td>
        </tr>
        <?php  }

    public function render_field($field)
    {
        $rows       = is_array($field['value']) ? $field['value'] : [];
        $field_name = $field['name'];
        $sub_fields = !empty($field['cols']) ? $field['cols'] : [];

        if (empty($sub_fields)) { ?>
            <p>
                <?= esc_html__('Añade al menos un sub campo en la configuración de este campo (pestaña de ajustes del campo) para poder usar el repetidor.', 'tac-structure') ?>
            </p>
        <?php return;
        } ?>

        <div class="custom-repeater-wrapper" data-field-name="<?= esc_attr($field_name); ?>">

            <div class="repeater-items-container">
                <?php
                if (! empty($rows)) {
                    foreach ($rows as $index => $row_values) {
                        $this->render_row_html($field_name, $index, $sub_fields, $row_values);
                    }
                }
                ?>
            </div>

            <div class="repeater-actions">
                <a href="#" class="acf-button button button-primary add-repeater-row">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus">
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                    </svg>
                    <?php _e('Añadir Fila', 'tac-structure'); ?>
                </a>
            </div>

            <script type="text/html" class="repeater-row-template">
                <?php $this->render_row_html($field_name, '__INDEX__', $sub_fields); ?>
            </script>

        </div>
    <?php
    }

    private function render_row_html($field_name, $index, $sub_fields, $values = [])
    {
        $is_template   = ($index === '__INDEX__');
        $display_index = $is_template ? '' : (intval($index) + 1);
    ?>
        <div class="repeater-item" data-index="<?= esc_attr($index); ?>">

            <div class="repeater-item-header">
                <span class="row-number"><?= esc_html($display_index); ?></span>

                <a href="#" class="remove-repeater-row" title="<?php _e('Eliminar fila', 'tac-structure'); ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                    <?php _e('Eliminar fila', 'tac-structure'); ?>
                </a>
            </div>

            <div class="repeater-item-body">
                <?php foreach ($sub_fields as $sub) :
                    $sub_name   = $sub['name'];
                    $sub_type   = isset($sub['type']) ? $sub['type'] : 'text';
                    $val        = isset($values[$sub_name]) ? $values[$sub_name] : '';
                    $input_name = $field_name . '[' . $index . '][' . $sub_name . ']'; ?>

                    <div class="repeater-field-row sub-field-type-<?= esc_attr($sub_type); ?>">
                        <div class="repeater-field-label">
                            <?= esc_html($sub['label']); ?>
                        </div>
                        <div class="repeater-field-input">
                            <?php $this->render_subfield_input($sub_type, $input_name, $val); ?>
                        </div>
                    </div>

                <?php endforeach; ?>
            </div>
        </div>
        <?php
    }

    private function render_subfield_input($type, $name, $value)
    {
        switch ($type) {
            case 'textarea': ?>
                <textarea name="<?= esc_attr($name) ?>" class="widefat"><?= esc_textarea($value) ?></textarea>
            <?php break;

            case 'number': ?>
                <input type="number" name="<?= esc_attr($name) ?>" value="<?= esc_attr($value) ?>" class="widefat" />
            <?php break;

            case 'url': ?>
                <input type="url" name="<?= esc_attr($name) ?>" value="<?= esc_attr($value) ?>" class="widefat" />
            <?php break;

            case 'email': ?>
                <input type="email" name="<?= esc_attr($name) ?>" value="<?= esc_attr($value) ?>" class="widefat" />
            <?php break;

            case 'image':
                $this->render_image_input($name, $value);
                break;

            case 'wysiwyg':
                $this->render_wysiwyg_input($name, $value);
                break;

            case 'text':
            default: ?>
                <input type="text" name="<?= esc_attr($name) ?>" value="<?= esc_attr($value) ?>" class="widefat" />
        <?php break;
        }
    }

    private function render_wysiwyg_input($name, $value)
    {
        ?>
        <div class="custom-repeater-wysiwyg-wrap">
            <textarea
                name="<?= esc_attr($name); ?>"
                class="widefat custom-repeater-wysiwyg"
                rows="8"><?= esc_textarea($value); ?></textarea>
        </div>
    <?php
    }

    private function render_image_input($name, $value)
    {
        $image_url = $value ? wp_get_attachment_image_url($value, 'thumbnail') : '';

    ?>
        <div class="custom-repeater-image-field">
            <input type="hidden" class="image-id-input" name="<?= esc_attr($name); ?>" value="<?= esc_attr($value); ?>" />
            <div class="image-preview-wrap">
                <?php if ($image_url) : ?>
                    <img src="<?= esc_url($image_url); ?>" class="image-preview" />
                <?php endif; ?>
            </div>
            <a href="#" class="button select-image-button"><?= $image_url ? __('Cambiar Imagen', 'tac-structure') : __('Seleccionar Imagen', 'tac-structure'); ?></a>
            <a href="#" class="button remove-image-button" style="<?= $image_url ? '' : 'display:none;'; ?>"><?php _e('Quitar', 'tac-structure'); ?></a>
        </div>
<?php
    }
    public function format_value($value, $post_id, $field)
    {
        if (empty($value) || ! is_array($value)) {
            return $value;
        }

        $sub_fields = !empty($field['sub_fields']) ? $field['sub_fields'] : ($field['cols'] ?? []);

        if (empty($sub_fields) && !empty($field['key'])) {
            $raw_field = acf_get_field($field['key']);

            if ($raw_field) {
                $raw_field  = $this->load_field($raw_field);
                $sub_fields = $raw_field['cols'] ?? [];
            }
        }

        if (empty($sub_fields)) {
            return $value;
        }

        $sub_fields_by_name = [];
        foreach ($sub_fields as $sub_field) {
            if (! empty($sub_field['name'])) {
                $sub_fields_by_name[$sub_field['name']] = $sub_field;
            }
        }

        foreach ($value as $k => $row) {
            if (! is_array($row)) {
                continue;
            }

            foreach ($row as $sub_name => $sub_value) {
                if (! isset($sub_fields_by_name[$sub_name])) {
                    continue;
                }

                $sub_type = $sub_fields_by_name[$sub_name]['type'] ?? 'text';

                switch ($sub_type) {
                    case 'image':
                        if (is_array($sub_value)) {
                            break;
                        }
                        $value[$k][$sub_name] = (is_numeric($sub_value) && (int) $sub_value > 0)
                            ? ImageFormatter::allSizesById((int) $sub_value)
                            : null;
                        break;

                    case 'wysiwyg':
                        $value[$k][$sub_name] = !empty($sub_value)
                            ? apply_filters('acf_the_content', $sub_value)
                            : $sub_value;
                        break;

                    case 'number':
                        $value[$k][$sub_name] = is_numeric($sub_value) ? $sub_value + 0 : $sub_value;
                        break;

                    case 'text':
                    case 'textarea':
                    case 'url':
                    case 'email':
                    default:
                        $value[$k][$sub_name] = $sub_value;
                        break;
                }
            }
        }

        return $value;
    }
}
