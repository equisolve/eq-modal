# Equisolve Modal

Helper class to integrate [a11y-dialog](https://a11y-dialog.netlify.app/) into Insite.

## Usage

Create the button, add the `eq-modal` class and specify the target element's ID.

```HTML
<button type="button" class="eq-modal" data-target="#target-dialog-id" data-title="Test Dialog">
    Click to view
</button>

<!-- Target Div -->
<div id="target-dialog">
    <h2>Dialog Title</h2>
    <p>Lorem Ipsum</p>
</div>
```

In the JS somewhere in the page load event, instantiate the class and it will go through the document and create the neccesary markup.

```javascript
document.addEventListener('DOMContentLoaded', function() {
    var modals = new EqModal();
});
```

## Options

You can override the defaults by passing in an object during instantiation.

```javascript
var opts = {
    selector: '.eq-modal', // This is how the script will identify all the buttons to target
    default_title: 'Dialog', // Accessible title for the dialog, can also be specified via the attribute "data-title" on the button
    style: {
        width: "600px", // Width is one of the default styles, but you can specify and CSS property here and it will applied to all dialogs
    }
}
var modals = new EqModal(opts);
```
