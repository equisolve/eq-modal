/* EqModal class
Helper class for a11y-dialog
https://github.com/equisolve/eq-modal
 */
const defaults = {
    selector: '.eq-modal',
    default_title: "Dialog",
    alert: false,
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
        if (!this.settings.alert) {
            this.dialogs = this.init();
        } else {
            this.dialogs = this.init_alert();
        }
    }

    // Uses selector specified in settings and generates modals
    init() {
        let settings = this.settings;
        let dialogs = document.querySelectorAll(settings.selector);
        let dlg_list = [];
        dialogs.forEach((btn, index) => {
            let dialog_id;
            let href = btn.getAttribute('href');
            let src = href ? href : btn.dataset.target;
            let dialog_type = btn.dataset.type ? btn.dataset.type : '';
            // Determine dialog type if not set by data-target
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
                // Changes URL links to anchor link to prevent navigating away from page
                if (dialog_type !== 'inline') {
                    btn.setAttribute('href', `#${dialog_id}`);
                }
            }
            dialog_id = dialog_type === 'inline' ? src.substring(1) : `${dialog_type}-dialog-${index}`;
            let dialog;
            let content;
            if (dialog_type === 'inline') {
                dialog = document.getElementById(dialog_id);
                if (!dialog) {
                    console.error(`Unable to find element with ID of '#${dialog_id}'`);
                    return;
                }
                content = dialog.innerHTML;
            } else {
                // Make a wrapper div for media items and iframes
                let wrapper = document.createElement('div');
                wrapper.id = dialog_id;
                wrapper.classList.add('dialog');
                dialog = wrapper;
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
            dialog_title.id = `${dialog_id}-title`;
            dialog_title.textContent = btn.dataset.title ? btn.dataset.title : settings.default_title;
            if (dialog_type !== 'inline') {
                document.body.appendChild(dialog);
            }
            let a_dialog = new A11yDialog(dialog);
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
            let scrollable = document.querySelector(`#${dialog_id} .dialog-inner`);
            a_dialog.on('show', (el) => {
                // focus the close button so arrow keys scroll the dialog
                el.querySelector('.dialog-inner button[aria-label="Close dialog"]').focus();
                bodyScrollLock.disableBodyScroll(scrollable);
            });
            a_dialog.on('hide', () => {
                location.hash = '';
                bodyScrollLock.enableBodyScroll(scrollable);
            });
        });
        return dlg_list;
    }

    init_alert() {
        let settings = this.settings;
        let dialogs = document.querySelectorAll(settings.selector);
        let dlg_list = [];
        dialogs.forEach((dlg, index) => {
            let dialog_type = dlg.dataset.type ? dlg.dataset.type : 'inline';
            let src = dlg.dataset.target;
            let dialog;
            let content;
            if (dialog_type === 'inline') {
                dialog = dlg;
                content = dlg.innerHTML;
            } else if (src) {
                // Make a wrapper div for media items and iframes
                let wrapper = document.createElement('div');
                wrapper.id = dlg.id;
                wrapper.classList.add('dialog');
                dialog = wrapper;
            } else {
                return;
            }
            if (dialog_type === 'image') {
                content = `<img src="${src}" alt="">`;
            }
            if (dialog_type === 'iframe') {
                content = `<iframe src="${src}">`;
            }
            dialog.setAttribute('aria-hidden', 'true');
            dialog.setAttribute('aria-labelledby', `${dlg.id}-title`);
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
            dialog_title.id = `${dlg.id}-title`;
            dialog_title.textContent = settings.default_title;
            if (dialog_type !== 'inline') {
                document.body.appendChild(dialog);
            }
            let a_dialog = new A11yDialog(dialog);
            dlg_list.push(a_dialog);
            // Disable/enable body scrolling on dialog open/close
            let scrollable = document.querySelector(`#${dlg.id} .dialog-inner`);
            a_dialog.on('show', (el) => {
                // focus the close button so arrow keys scroll the dialog
                el.querySelector('.dialog-inner button[aria-label="Close dialog"]').focus();
                bodyScrollLock.disableBodyScroll(scrollable);
            });
            a_dialog.on('hide', () => {
                location.hash = '';
                bodyScrollLock.enableBodyScroll(scrollable);
            });
        });
        return dlg_list;
    }
}