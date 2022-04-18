/* EqModal class
Helper class for a11y-dialog
 */
const defaults = {
    selector: ".eq-modal",
    default_title: "Dialog",
    style: {
        width: "600px",
    }
}
defaults.modal_html = `<div data-a11y-dialog-hide></div>
    <div class="dialog-inner" role="document">
        <button type="button" data-a11y-dialog-hide aria-label="Close dialog">&times;</button>
        <h1 id="" class="sr-only"></h1>
        <div class="dialog-inner-content"></div>
    </div>`;

class EqModal {
    constructor(options = {}) {
        this.settings = defaults;
        // override defaults if provided
        for (const prop in options) {
            this.settings[prop] = options[prop];
            if (prop === "style") {
                for (const style_name in options.style) {
                    this.settings.style[style_name] = options.style[style_name];
                }
            }
        }
        this.init();
    }

    // Uses selector specified in settings and generates modals
    init() {
        let settings = this.settings;
        let dialogs = document.querySelectorAll(settings.selector);
        dialogs.forEach((btn) => {
            let dialog_id = btn.dataset.target;
            if (!dialog_id) {
                console.error("A target must be specified.");
                return;
            }
            let dialog = document.getElementById(dialog_id);
            if (!dialog) {
                console.error("Unable to find element with ID of '#" + dialog_id + "'");
                return;
            }
            if (dialog.tagName === "IMG") {
                let img_id = dialog.id;
                dialog.id = "";
                let wrapper = document.createElement('div');
                dialog.parentNode.insertBefore(wrapper, dialog);
                wrapper.appendChild(dialog);
                wrapper.id = dialog.id;
                dialog = wrapper;
            }
            let content = dialog.innerHTML;
            dialog.setAttribute("aria-hidden", "true");
            dialog.setAttribute("aria-labelledby", dialog_id + "-title");
            dialog.classList.add("dialog-container");
            // Apply template and insert content
            dialog.innerHTML = settings.modal_html;
            let inner_content = dialog.querySelector(".dialog-inner-content");
            inner_content.innerHTML = content;
            let dialog_title = dialog.querySelector(".dialog-inner > h1");
            dialog_title.id = dialog_id + "-title";
            if (btn.dataset.title) {
                dialog_title.textContent = btn.dataset.title;
            } else {
                dialog_title.textContent = settings.default_title;
            }
            // Apply styling
            for (const style_name in settings.style) {
                inner_content.style[style_name] = settings.style[style_name];
            }
            // Instantiate a11y-dialog and attach the show event to the button
            let a_dialog = new A11yDialog(dialog);
            btn.addEventListener('click', (evt) => {
                evt.preventDefault(); // Stop anchor tags from showing up in the URL
                a_dialog.show();
            });
            btn.addEventListener('keyup', (evt) => {
                if ((evt.code !== 32) && (evt.code !== 13)) {
                    return false;
                }
                evt.preventDefault(); // Stop anchor tags from showing up in the URL
                a_dialog.show();
            });
        });
    }
}