'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* EqModal class
Helper class for a11y-dialog
https://github.com/equisolve/eq-modal
 */
var defaults = {
    selector: '.eq-modal',
    default_title: "Dialog",
    alert: false,
    style: {
        width: '600px'
    }
};
defaults.modal_html = '<div data-a11y-dialog-hide></div>' + '<div class="dialog-inner" role="document">' + '<button type="button" data-a11y-dialog-hide aria-label="Close dialog">&times;</button>' + '<h1 id="" class="sr-only"></h1>' + '<div class="dialog-inner-content" tabindex="-1"></div>' + '</div>';

var EqModal = function () {
    function EqModal() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, EqModal);

        this.settings = defaults;
        // override defaults if provided
        for (var prop in options) {
            this.settings[prop] = options[prop];
            if (prop === 'style') {
                for (var style_name in options.style) {
                    this.settings.style[style_name] = options.style[style_name];
                }
            }
        }
        if (!this.settings.alert) {
            this.dialogs = this.init();
        } else {
            this.dialogs = this.init_alert();
        }
    }

    // Uses selector specified in settings and generates modals


    _createClass(EqModal, [{
        key: 'init',
        value: function init() {
            var settings = this.settings;
            var dialogs = document.querySelectorAll(settings.selector);
            var dlg_list = [];
            dialogs.forEach(function (btn, index) {
                var dialog_id = void 0;
                var href = btn.getAttribute('href');
                var src = href ? href : btn.dataset.target;
                var dialog_type = btn.dataset.type ? btn.dataset.type : '';
                // Determine dialog type if not set by data-target
                if (!dialog_type) {
                    if (src.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i)) {
                        dialog_type = 'image';
                    } else if (src.match(/\.(pdf)((\?|#).*)?$/i)) {
                        dialog_type = 'iframe';
                    } else if (src[0] === '#') {
                        dialog_type = 'inline';
                    } else {
                        console.error('Could not determine the dialog type for ' + src + '. Please specify the attribute \'data-type\'.');
                        return;
                    }
                    // Changes URL links to anchor link to prevent navigating away from page
                    if (dialog_type !== 'inline') {
                        btn.setAttribute('href', '#' + dialog_id);
                    }
                }
                dialog_id = dialog_type === 'inline' ? src.substring(1) : dialog_type + '-dialog-' + index;
                var dialog = void 0;
                var content = void 0;
                if (dialog_type === 'inline') {
                    dialog = document.getElementById(dialog_id);
                    if (!dialog) {
                        console.error('Unable to find element with ID of \'#' + dialog_id + '\'');
                        return;
                    }
                    content = dialog.innerHTML;
                } else {
                    // Make a wrapper div for media items and iframes
                    var wrapper = document.createElement('div');
                    wrapper.id = dialog_id;
                    wrapper.classList.add('dialog');
                    dialog = wrapper;
                }
                if (dialog_type === 'image') {
                    content = '<img src="' + src + '" alt="">';
                }
                if (dialog_type === 'iframe') {
                    content = '<iframe src="' + src + '">';
                }
                dialog.setAttribute('aria-hidden', 'true');
                dialog.setAttribute('aria-labelledby', dialog_id + '-title');
                dialog.classList.add('dialog-container');
                // Apply template and insert content
                dialog.innerHTML = settings.modal_html;
                var inner_content = dialog.querySelector('.dialog-inner-content');
                inner_content.innerHTML = content;
                // Apply styling
                for (var style_name in settings.style) {
                    inner_content.style[style_name] = settings.style[style_name];
                }
                var dialog_title = dialog.querySelector('.dialog-inner > h1');
                dialog_title.id = dialog_id + '-title';
                dialog_title.textContent = btn.dataset.title ? btn.dataset.title : settings.default_title;
                if (dialog_type !== 'inline') {
                    document.body.appendChild(dialog);
                }
                var a_dialog = new A11yDialog(dialog);
                dlg_list.push(a_dialog);
                btn.addEventListener('click', function (evt) {
                    a_dialog.show();
                });
                btn.addEventListener('keyup', function (evt) {
                    // Space or Enter
                    if (evt.code !== 32 && evt.code !== 13) {
                        return false;
                    }
                    a_dialog.show();
                });
                // Disable/enable body scrolling on dialog open/close
                var scrollable = document.querySelector('#' + dialog_id + ' .dialog-inner');
                a_dialog.on('show', function (el) {
                    // focus the close button so arrow keys scroll the dialog
                    el.querySelector('.dialog-inner button[aria-label="Close dialog"]').focus();
                    bodyScrollLock.disableBodyScroll(scrollable);
                });
                a_dialog.on('hide', function () {
                    location.hash = '';
                    bodyScrollLock.enableBodyScroll(scrollable);
                });
            });
            return dlg_list;
        }
    }, {
        key: 'init_alert',
        value: function init_alert() {
            var settings = this.settings;
            var dialogs = document.querySelectorAll(settings.selector);
            var dlg_list = [];
            dialogs.forEach(function (dlg, index) {
                var dialog_type = dlg.dataset.type ? dlg.dataset.type : 'inline';
                var src = dlg.dataset.target;
                var dialog = void 0;
                var content = void 0;
                if (dialog_type === 'inline') {
                    dialog = dlg;
                    content = dlg.innerHTML;
                } else if (src) {
                    // Make a wrapper div for media items and iframes
                    var wrapper = document.createElement('div');
                    wrapper.id = dlg.id;
                    wrapper.classList.add('dialog');
                    dialog = wrapper;
                } else {
                    return;
                }
                if (dialog_type === 'image') {
                    content = '<img src="' + src + '" alt="">';
                }
                if (dialog_type === 'iframe') {
                    content = '<iframe src="' + src + '">';
                }
                dialog.setAttribute('aria-hidden', 'true');
                dialog.setAttribute('aria-labelledby', dlg.id + '-title');
                dialog.classList.add('dialog-container');
                // Apply template and insert content
                dialog.innerHTML = settings.modal_html;
                var inner_content = dialog.querySelector('.dialog-inner-content');
                inner_content.innerHTML = content;
                // Apply styling
                for (var style_name in settings.style) {
                    inner_content.style[style_name] = settings.style[style_name];
                }
                var dialog_title = dialog.querySelector('.dialog-inner > h1');
                dialog_title.id = dlg.id + '-title';
                dialog_title.textContent = settings.default_title;
                if (dialog_type !== 'inline') {
                    document.body.appendChild(dialog);
                }
                var a_dialog = new A11yDialog(dialog);
                dlg_list.push(a_dialog);
                // Disable/enable body scrolling on dialog open/close
                var scrollable = document.querySelector('#' + dlg.id + ' .dialog-inner');
                a_dialog.on('show', function (el) {
                    // focus the close button so arrow keys scroll the dialog
                    el.querySelector('.dialog-inner button[aria-label="Close dialog"]').focus();
                    bodyScrollLock.disableBodyScroll(scrollable);
                });
                a_dialog.on('hide', function () {
                    location.hash = '';
                    bodyScrollLock.enableBodyScroll(scrollable);
                });
            });
            return dlg_list;
        }
    }]);

    return EqModal;
}();