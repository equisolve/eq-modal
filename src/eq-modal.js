/* EqModal class
Helper class for a11y-dialog
https://github.com/equisolve/eq-modal
 */
const defaults = {
    selector: '.eq-modal',
    default_title: "Dialog",
    button: false, // dialog is opened via button
    style: {
        width: '600px',
    }
}
defaults.modal_html = `<div data-a11y-dialog-hide></div>` +
    `<div class="dialog-inner" role="document">` +
    `<button type="button" data-a11y-dialog-hide aria-label="Close dialog">&times;</button>` +
    `<h1 id="" class="sr-only"></h1>` +
    `<div class="dialog-inner-content" tabindex="-1"></div>` +
    `</div>`;

class EqModal {
    constructor(options = {}) {
        this.settings = defaults;
        // override defaults if provided
        for (const prop in options) {
            this.settings[prop] = options[prop];
            if (prop === 'style') {
                for (const style_name in options.style) {
                    this.settings.style[style_name] = options.style[style_name];
                }
            }
        }
        this.dialogs = this.init();
    }

    // Uses selector specified in settings and generates modals
    init() {
        let settings = this.settings;
        let dialogs = document.querySelectorAll(settings.selector);
        let dlg_list = [];
        dialogs.forEach((el) => {
            let a_dialog = this.create_dialog(el);
            dlg_list.push(a_dialog);
        });
        return dlg_list;
    }

    /*
    Create a dialog based off parameters on the given element
    target_el is either a target element to become the dialog or the button that will trigger the dialog
     */
    create_dialog(target_el) {
        let settings = this.settings;
        let dialog, content, dialog_type, src, href, dialog_id;
        if (settings.button) {
            // extract dialog type from data-target if available
            href = target_el.getAttribute('href');
            src = href ? href : target_el.dataset.target;
            dialog_type = target_el.dataset.type ? target_el.dataset.type : '';
            // attempt to determine dialog type if one is not specified
            if (!dialog_type) {
                if (src.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i)) {
                    dialog_type = 'image';
                } else if (src.match(/\.(pdf)((\?|#).*)?$/i)) {
                    dialog_type = 'iframe';
                } else if (src[0] === '#') {
                    dialog_type = 'inline';
                } else {
                    console.error(`Could not determine the dialog type for ${src}. Please specify the attribute 'data-type'.`);
                    return;
                }
            }
            // Converts URL links to anchor link to prevent navigating away from page
            if (href) {
                target_el.setAttribute('href', `#${dialog_id}`);
            }
        } else {
            dialog_type = target_el.dataset.type ? target_el.dataset.type : 'inline';
            src = target_el.dataset.target;
        }
        dialog_id = dialog_type === 'inline' && src ? src.substring(1) : this.generate_dialog_id(dialog_type);
        if (dialog_type === 'inline') {
            if (settings.button) {
                dialog = document.getElementById(dialog_id);
                if (!dialog) {
                    console.error('Unable to find element with ID of \'#' + dialog_id + '\'');
                    return;
                }
                content = dialog.innerHTML;
            } else {
                dialog = target_el;
                content = target_el.innerHTML;
            }
        } else if (src) {
            let wrapper = document.createElement('div');
            wrapper.id = target_el.id;
            wrapper.classList.add('dialog');
            dialog = wrapper;
        } else {
            console.error(`No valid target div or data-target was found.`);
            return;
        }
        if (dialog_type === 'image') {
            content = `<img src="${src}" alt="">`;
        }
        if (dialog_type === 'iframe') {
            content = `<iframe src="${src}">`;
        }
        dialog.setAttribute('aria-hidden', 'true');
        dialog.setAttribute('aria-labelledby', `${dialog_id}-title`);
        dialog.classList.add('dialog-container');
        // Apply template and insert content
        dialog.innerHTML = settings.modal_html;
        let inner_content = dialog.querySelector('.dialog-inner-content');
        inner_content.innerHTML = content;
        // Apply styling
        for (const style_name in settings.style) {
            inner_content.style[style_name] = settings.style[style_name];
        }
        let dialog_title = dialog.querySelector('.dialog-inner > h1');
        dialog_title.id = `${target_el.id}-title`;
        dialog_title.textContent = settings.default_title;
        if (dialog_type !== 'inline') {
            document.body.appendChild(dialog);
        }
        let a_dialog = new A11yDialog(dialog);
        // Disable/enable body scrolling on dialog open/close
        let scrollable = document.querySelector(`#${dialog.id} .dialog-inner`);
        a_dialog.on('show', (el) => {
            // focus the close button so arrow keys scroll the dialog
            el.querySelector('.dialog-inner button[aria-label="Close dialog"]').focus();
            bodyScrollLock.disableBodyScroll(scrollable);
        });
        a_dialog.on('hide', () => {
            location.hash = '';
            bodyScrollLock.enableBodyScroll(scrollable);
        });
        if (settings.button) {
            target_el.addEventListener('click', function () {
                a_dialog.show();
            });
            target_el.addEventListener('keyup', function (evt) {
                // Space or Enter
                if (evt.code !== 32 && evt.code !== 13) {
                    return false;
                }
                a_dialog.show();
            });
        }
        return a_dialog;
    }

    generate_dialog_id(dialog_type) {
        let index = 0;
        let id = dialog_type + '-dialog-' + index;
        while (document.getElementById(id)) {
            index++;
            id = dialog_type + '-dialog-' + index;
        }
        return id;
    }
}