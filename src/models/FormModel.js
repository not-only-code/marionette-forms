Backbone.Marionette.FormModel = Backbone.Model.extend({

    schema: {},

    initialize: function() {
        this.validation_keys = _.keys(this.validations);
    },

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
                        return (opts.options.repeat.val() === input && this.text(input, opts));
                    } else {
                        return this.text(input, opts);
                    }

            } else {

                return this.text(input, opts);
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

    _validate: function(attrs, options) {
        if (!options.validate || !this.validate) {
            return true;
        }
        var error = this.validationError = this.validate(attrs, options) || null;
        if (!error) {
            return true;
        }
        this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
        return false;
    },

    validate: function(attributes, options) {
        var opts, val;

        if (_.isUndefined(this.schema) || _.isEmpty(this.schema)) {
            return;
        }

        for (var key in attributes) {
            opts = this.schema[key] || null;
            val = attributes[key];

            if (!_.isNull(opts) && _.has(opts, 'type') && _.contains(this.validation_keys, opts.type)) {
                
                if (_.isFunction(this.validations[opts.type])) {
                    opts.valid = this.validations[opts.type](val, opts);
                } else {
                    opts.valid = this.validations[opts.type].test(val);
                }

                if (!opts.valid) {
                    this.trigger('invalid:' + key, opts);
                    return options.message;
                }
            }
        }
    }

});