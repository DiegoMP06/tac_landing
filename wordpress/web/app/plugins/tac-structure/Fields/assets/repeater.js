// repeater.js

jQuery(document).ready(function ($) {
    if (window.__acfRepeaterPostFieldBound) {
        return;
    }
    window.__acfRepeaterPostFieldBound = true;

    var editorCounter = 0;

    // Genera un ID de editor garantizado único, sin importar cuántas
    // veces se agreguen/quiten filas en la sesión actual.
    function nextEditorId() {
        editorCounter += 1;
        return "cr_editor_" + Date.now() + "_" + editorCounter;
    }

    function reindexRow($row, index) {
        $row.find(".row-number").text(index + 1);
        $row.find("input, select, textarea").each(function () {
            var name = $(this).attr("name");
            if (name) {
                name = name.replace(/\[\d+\]/, "[" + index + "]");
                $(this).attr("name", name);
            }
        });
    }

    // Inicializa TinyMCE/Quicktags para todos los .custom-repeater-wysiwyg
    // dentro de $scope que aún no tengan editor asignado.
    function initWysiwygFields($scope) {
        if (typeof wp === "undefined" || !wp.editor) {
            return;
        }

        $scope.find(".custom-repeater-wysiwyg").each(function () {
            var $textarea = $(this);

            if ($textarea.data("editor-initialized")) {
                return;
            }

            var id = nextEditorId();
            $textarea.attr("id", id);
            $textarea.data("editor-initialized", true);

            wp.editor.initialize(id, {
                tinymce: {
                    wpautop: true,
                    toolbar1:
                        "bold,italic,bullist,numlist,blockquote,link,unlink,undo,redo",
                    toolbar2: "",
                },
                quicktags: true,
            });
        });
    }

    // Destruye limpiamente las instancias de editor antes de quitar
    // una fila del DOM (evita fugas de memoria y errores de TinyMCE).
    function removeWysiwygFields($scope) {
        if (typeof wp === "undefined" || !wp.editor) {
            return;
        }

        $scope.find(".custom-repeater-wysiwyg").each(function () {
            var id = $(this).attr("id");
            if (id) {
                wp.editor.remove(id);
            }
        });
    }

    // Inicializa los editores de las filas ya presentes al cargar
    // la pantalla (datos guardados previamente).
    initWysiwygFields($(document));

    // Add New Row
    $(document).on("click", ".add-repeater-row", function (e) {
        e.preventDefault();

        var $wrapper = $(this).closest(".custom-repeater-wrapper");
        var $container = $wrapper.find(".repeater-items-container");
        var nextIndex = $container.find(".repeater-item").length;

        var templateHtml = $wrapper.find(".repeater-row-template").html();
        var $newRow = $(templateHtml);

        $newRow.find("input, select, textarea").each(function () {
            var name = $(this).attr("name");
            if (name) {
                name = name.replace("__INDEX__", nextIndex);
                $(this).attr("name", name);
            }
            $(this).removeAttr("disabled");
        });

        $newRow.attr("data-index", nextIndex);
        $newRow.find(".row-number").text(nextIndex + 1);
        $container.append($newRow);

        // Inicializa WYSIWYG SOLO dentro de la fila nueva.
        initWysiwygFields($newRow);
    });

    // Remove Row and Re-index
    $(document).on("click", ".remove-repeater-row", function (e) {
        e.preventDefault();

        var $wrapper = $(this).closest(".custom-repeater-wrapper");
        var $row = $(this).closest(".repeater-item");

        // Destruye los editores de ESTA fila antes de animarla/quitarla.
        removeWysiwygFields($row);

        $row.fadeOut(180, function () {
            $(this).remove();

            $wrapper
                .find(".repeater-items-container .repeater-item")
                .each(function (index) {
                    reindexRow($(this), index);
                });
        });
    });

    // Selector de imagen (wp.media) para sub-campos tipo "image"
    var currentImageFrame;

    $(document).on("click", ".select-image-button", function (e) {
        e.preventDefault();

        var $button = $(this);
        var $wrap = $button.closest(".custom-repeater-image-field");

        currentImageFrame = wp.media({
            title: "Seleccionar Imagen",
            multiple: false,
            library: { type: "image" },
        });

        currentImageFrame.on("select", function () {
            var attachment = currentImageFrame
                .state()
                .get("selection")
                .first()
                .toJSON();

            var previewUrl =
                attachment.sizes && attachment.sizes.thumbnail
                    ? attachment.sizes.thumbnail.url
                    : attachment.url;

            $wrap.find(".image-id-input").val(attachment.id);
            $wrap
                .find(".image-preview-wrap")
                .html('<img src="' + previewUrl + '" class="image-preview" />');
            $wrap.find(".select-image-button").text("Cambiar Imagen");
            $wrap.find(".remove-image-button").show();
        });

        currentImageFrame.open();
    });

    $(document).on("click", ".remove-image-button", function (e) {
        e.preventDefault();

        var $wrap = $(this).closest(".custom-repeater-image-field");
        $wrap.find(".image-id-input").val("");
        $wrap.find(".image-preview-wrap").empty();
        $wrap.find(".select-image-button").text("Seleccionar Imagen");
        $(this).hide();
    });

    // Red de seguridad: al enviar el formulario del post, forzamos que
    // TinyMCE sincronice el contenido visual hacia el <textarea> real
    // antes de que se serialice el formulario.
    $(document).on("submit", "#post", function () {
        if (typeof tinymce !== "undefined") {
            tinymce.triggerSave();
        }
    });
});
