// field-settings.js

jQuery(document).ready(function ($) {
    // Guard anti-doble-bind (por si ACF re-imprime el script vía AJAX)
    if (window.__acfRepeaterFieldSettingsBound) {
        return;
    }
    window.__acfRepeaterFieldSettingsBound = true;

    function slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
    }

    function getWrapper($el) {
        return $el.closest(".custom-repeater-subfields-wrapper");
    }

    // Localiza el textarea REAL que ACF guarda (renderizado por
    // acf_render_field_setting), usando el ID que el PHP le puso
    // al wrapper. No dependemos de posición en el DOM ni de índices.
    function getJsonTextarea($wrapper) {
        var targetId = $wrapper.data("json-wrapper-id");
        return $("#" + targetId).find("textarea");
    }

    function syncJsonInput($wrapper) {
        var columns = [];

        $wrapper.find(".subfields-rows .subfield-row").each(function () {
            var $row = $(this);
            var label = $row.find(".sub-label-input").val() || "";
            var name = $row.find(".sub-name-input").val() || "";
            var type = $row.find(".sub-type-select").val() || "text";

            // Ignora filas totalmente vacías (recién agregadas sin llenar)
            if (label === "" && name === "") {
                return;
            }

            columns.push({ label: label, name: name, type: type });
        });

        getJsonTextarea($wrapper).val(JSON.stringify(columns));
    }

    $(document).on("click", ".add-subfield-row", function (e) {
        e.preventDefault();

        var $wrapper = getWrapper($(this));
        var $tbody = $wrapper.find(".subfields-rows");
        var templateHtml = $wrapper.find(".subfield-row-template").html();

        $tbody.append($(templateHtml));
        syncJsonInput($wrapper);
    });

    $(document).on("click", ".remove-subfield-row", function (e) {
        e.preventDefault();

        var $wrapper = getWrapper($(this));
        $(this).closest(".subfield-row").remove();

        syncJsonInput($wrapper);
    });

    $(document).on("input", ".sub-label-input", function () {
        var $row = $(this).closest(".subfield-row");
        var $nameInput = $row.find(".sub-name-input");

        if (
            !$nameInput.data("user-edited-runtime") &&
            $nameInput.data("user-edited") != "1"
        ) {
            $nameInput.val(slugify($(this).val()));
        }

        syncJsonInput(getWrapper($(this)));
    });

    $(document).on("input", ".sub-name-input", function () {
        $(this).data("user-edited-runtime", true);
        syncJsonInput(getWrapper($(this)));
    });

    $(document).on("change", ".sub-type-select", function () {
        syncJsonInput(getWrapper($(this)));
    });

    // Sincronización inicial al cargar la pantalla: garantiza que el
    // textarea real y la tabla visual arrancan idénticos.
    $(".custom-repeater-subfields-wrapper").each(function () {
        syncJsonInput($(this));
    });
});
