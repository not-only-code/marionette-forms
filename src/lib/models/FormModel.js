var FormModel = Backbone.Model.extend({
    // validar cada tipo de datos lanzando un evento

    types: ['email', 'text', 'number', 'url'],

    validations: {
        email: /^[\w\-]{1,}([\w\-\+.]{1,1}[\w\-]{1,}){0,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/,
        url: /^(http|https):\/\/(([A-Z0-9][A-Z0-9_\-]*)(\.[A-Z0-9][A-Z0-9_\-]*)+)(:(\d+))?\/?/i,
        number: /^[0-9]*\.?[0-9]*?$/,
        text: function(input) {
            return (typeof input === 'string' && input.length > 2);
        }
    },

    validate: function(attributes, options) {

        if (_.has(options, 'key') && _.has(options, 'type') && _.contains(this.types, options.type)) {
            var valid;
            if (typeof this.validations[options.type] === 'function') {
                valid = this.validations[options.type](attributes[options.key]);
            } else {
                valid = this.validations[options.type].test(attributes[options.key]);
            }

            if (!valid) {
                this.trigger('invalid:'+options.key, options);
                return options.message;
            }
        }
    }

});

Backbone.Marionette.FormModel = FormModel;