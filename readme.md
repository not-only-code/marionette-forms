#Marionette Forms

> Marionette Forms helps you to automate validation tasks on your forms.

As [Backbone Forms](https://github.com/powmedia/backbone-forms) does, **Marionette Forms** automate tasks such as validations and data modeling, but in a more simple way, that means:

**Marionette Forms does not render your fields, you must provide the entire html form to the FormView.**

## Installation

Run npm install ([**node**](http://nodejs.org) and [**npm**](https://npmjs.org) previously installed)

    $ npm install


## Usage

Import the script
```html
<!-- first all dependences: jquery, usderscore, backbone, marionettejs -->
<script src="marionette-forms/dist/marionette-forms.min.js"></script>
<script src="app.js"></script><!-- your application script -->
```

Form html:
```html
<form id="my-form">
    <input type="email" class="field email">
    <input type="text" class="field password">
    <input type="submit" class="field submit">
</form>
```
In your project, initialize **FormView**:
```js
var myForm = Backbone.Marionette.FormView.extend({
    el: '#my-form',
    schema: {
        name: {
            ui: '.field.name',
            event: 'input',
            type: 'text'
        },
        email: {
            ui: '.field.password',
            event: 'input',
            type: 'email'
        }
        password: {
            ui: '.field.password',
            event: 'input',
            type: 'text'
        }
    }
});

new myForm();
```

It automatically should create on the way **myForm.model** attributes and listen DOM events you assigned in **event** to validate and save each field:
```json
{
    "name": "",
    "email": "",
    "password": ""
}
```
You can also create and customize the model before:
```js
var myFormModel = Backbone.Marionette.FormModel.extend({
    defaults: {
        id: null,
        name: '',
        email: '',
        password: '',
        active: true
    },
    myCustomFunction: function() {
        // bla bla bla
    }
});

new myForm({
    model: new myFormModel();
});
```

## Field schema options

attribute      | description                                                                        | default
---------------|------------------------------------------------------------------------------------|-------------
ui             | jquery selector                                                                    | null
event          | DOM event associated to the field ('input', 'click', 'change', 'submit', ...)      | null
validate       | if you want to validate this field, it allways will be saved to the field          | true
type           | type of validation to apply ('text', 'email', 'url', 'number', 'radio', 'custom')  | 'text'
message        | error message validating field                                                     | 'invalid field'


Each field will be marked as 'required' (**class="required"**) if you must to validate it (**validate: true**).  
Also each invalid field will be marked as 'invalid' (**class="invalid"**) if do not pass validation.  
Of course you can override this behaviors extending **FormView** class.  


## Two-way binding
You can inject data in the model and the fields will show the value instantly.
```js
myFormModel.set('name', 'Joshua');
// this means the input name will replace his value for 'Joshua'
```

You can avoid this behavior setting up **FormView** with `model_binding` = `false`.
```js
new myForm({
    model: new myFormModel();
    model_binding: false
});
```
[Here, a practical example how to fill a form injecting data in the model.](http://jsfiddle.net/ywjgjkxv/1)

## FormView methods

Some functions will be executed when at some behaviors: 

method      | description                                                                        | return
------------|------------------------------------------------------------------------------------|-------------
`valid`     | this function is called when all required fields are valid, you can override it    | 
`invalid`   | this function is called when one required field is invalid, you can override it    | 
`saveAll`   | you can call this function to save and validate all fields                         | 
`isValid`   | you can call this function to know if the form is valid or not                     | `boolean`

Just before `valid` or `invalid` are called  the form will be marked as 'valid/invalid' (**class="invalid"**) so you can show the status via css like the fields. 


All validation events will be removed on **FormView.destroy()** and re-apply on **.show()** following **MarionetteJS** patterns in order to avoid memory leaks.