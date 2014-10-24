Backbone.Marionette.FormModel = Backbone.Model.extend({
    // validar cada tipo de datos lanzando un evento

    validations: {
        email: /^[\w\-]{1,}([\w\-\+.]{1,1}[\w\-]{1,}){0,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/,
        url: /^(http|https):\/\/(([A-Z0-9][A-Z0-9_\-]*)(\.[A-Z0-9][A-Z0-9_\-]*)+)(:(\d+))?\/?/i,
        number: /^\d+$/,
        text: function(input, opts) {
            var length =  (opts.options && opts.options.length) ? opts.options.length : 3; 
            return (_.isString(input) && input.length >= length);
        },
        select: function(input, opts) {
            var def = (opts.options && opts.options.default) ? opts.options.default : "0";
            return (_.isString(input) && input !== def);
        },
        password: function(input, opts) {
            if (_.has(opts.options, 'repeat') ) {

                    if (_.isString(opts.options.repeat)) {
                        opts.options.repeat = $(opts.options.repeat);
                    }

                    if (opts.options.repeat instanceof jQuery) {

                        return opts.options.repeat.val() === input;

                    } else {
                        return this.validateText(input, opts);
                    }
                } else {
                    return this.validateText(input, opts);
            }
        },
        regexp: function(input, opts) {
            if (!_.has(opts.options, 'regexp')) {
                throw new Error("Regexp validation must have a regexp option to validate it");
            }

            if (!_.isRegExp(opts.options.regexp)) {
                throw new Error("options.regexp must be a regular expression");  
            }

            return opts.options.regexp.test(input);
        },
        radio: function(input, opts) {
            return (!_.isUndefined(input));
        },
        checkbox: function(input, opts) {
            return input;
        },
        custom: function(input, opts) {
            if (!_.isFunction(opts.options.regexp)) {
                throw new Error("options must be a function");
            }
            return opts.options(input);
        }
    },

    validate: function(attributes, options) {

        if (_.has(options, 'key') && _.has(options, 'type') && _.contains(_.keys(this.validations), options.type)) {
            var valid;
            if (_.isFunction(this.validations[options.type])) {
                valid = this.validations[options.type](attributes[options.key], options);
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