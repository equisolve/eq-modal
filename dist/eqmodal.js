"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* EqModal class
Helper class for a11y-dialog
 */
var defaults = {
    selector: ".eq-modal",
    default_title: "Dialog",
    style: {
        width: "600px"
    }
};
defaults.modal_html = "<div data-a11y-dialog-hide></div>\n    <div class=\"dialog-inner\" role=\"document\">\n        <button type=\"button\" data-a11y-dialog-hide aria-label=\"Close dialog\">&times;</button>\n        <h1 id=\"\" class=\"sr-only\"></h1>\n        <div class=\"dialog-inner-content\"></div>\n    </div>";

var EqModal = function () {
    function EqModal() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, EqModal);

        this.settings = defaults;
        // override defaults if provided
        for (var prop in options) {
            this.settings[prop] = options[prop];
        }
        this.init();
    }

    // Uses selector specified in settings and generates modals


    _createClass(EqModal, [{
        key: "init",
        value: function init() {
            var settings = this.settings;
            var dialogs = document.querySelectorAll(settings.selector);
            dialogs.forEach(function (btn) {
                var dialog_id = btn.dataset.target;
                if (!dialog_id) {
                    console.error("A target must be specified.");
                    return;
                }
                var dialog = document.getElementById(dialog_id);
                if (!dialog) {
                    console.error("Unable to find element with ID of '#" + dialog_id + "'");
                    return;
                }
                var content = dialog.innerHTML;
                dialog.setAttribute("aria-hidden", "true");
                dialog.setAttribute("aria-labelledby", dialog_id + "-title");
                dialog.classList.add("dialog-container");
                // Apply template and insert content
                dialog.innerHTML = settings.modal_html;
                var inner_content = dialog.querySelector(".dialog-inner-content");
                inner_content.innerHTML = content;
                var dialog_title = dialog.querySelector(".dialog-inner > h1");
                if (btn.dataset.title) {
                    dialog_title.textContent = btn.dataset.title;
                } else {
                    dialog_title.textContent = settings.default_title;
                }
                // Apply styling
                for (var style_name in settings.style) {
                    inner_content.style[style_name] = settings.style[style_name];
                }
                // Instantiate a11y-dialog and attach the show event to the button
                var a_dialog = new A11yDialog(dialog);
                btn.addEventListener('click', function () {
                    a_dialog.show();
                });
                btn.addEventListener('keyup', function (evt) {
                    if (evt.code !== 32 && evt.code !== 13) {
                        return false;
                    }
                    a_dialog.show();
                });
            });
        }
    }]);

    return EqModal;
}();