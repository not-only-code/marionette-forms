var FormModel = Backbone.Model.extend({
    // validar cada tipo de datos lanzando un evento

    validationTypes: ['email', 'text', 'number', 'url', 'regexp'],

    validate: function(attributes, options) {
        console.log(options.type);
    }

});

Backbone.Marionette.FormModel = FormModel;