/**
 * Automatize form actions with MarionetteJS
 * 0.0.1
 *
 * 2014 Carlos Sanz Garcia
 * Distributed under MIT license
 *
 * https://github.com/not-only-code/marionette-forms
 */
;(function() {
"use strict";

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
Backbone.Marionette.FormView = Backbone.Marionette.View.extend({
    
    defaultSchema: {
        ui: null,
        event: null,
        validate: true,
        valid: true,
        type: 'text',
        message: 'invalid field'
    },

    options: {
        model_binding: true
    },

    schema: {},

    ui: {},

    constructor: function(options) {

        if (_.isUndefined(options) || _.isUndefined(options.model)) {
            this.model = new Backbone.Marionette.FormModel();
        }

        if (!_.isUndefined(options) &&_.has(options, 'schema')) {
            _.extend(this.schema, options.schema);
        }

        if (_.isEmpty(this.schema)) {
            throw new Error("FormView instance has empty schema");
        }

        this.addSchemaElements();

        Backbone.Marionette.View.apply(this, arguments);

        if (!_.isUndefined(this.model)) {
            this.model.schema = this.schema;
        }

        return this;
    },

    addSchemaElements: function() {

        for( var key in this.schema) {
            var item = this.schema[key];

            // adds schema item to ui
            if (_.has(item, 'ui') && !_.isEmpty(item.ui)) {
                this.ui[key] = item.ui;
            }

            // extends defaults
            this.schema[key] = _.extend(_.clone(this.defaultSchema), item);

            // creates a self ref inside each item
            if (!_.has(item, 'key')) {
                this.schema[key].key = key;
            }
        }
    },

    delegateFormEvents: function() {

        if (!this.$el) {
            return;
        }

        for (var key in this.schema) {
            var item = this.schema[key];

            if (_.isNull(item.ui) || _.isNull(item.event)) {
                return;
            }

            this.delegateFormItem(item.event, item.ui, _.bind(this.saveItem, this), item);

            if (item.validate) {
                this.ui[key].addClass('required');
                this.schema[key].valid = false;
                this.listenTo(this.model, 'invalid:'+key, this.errorItem);
            }
        }

        this.isValid();
        this.listenTo(this.model, 'invalid', this._invalid);
        if (this.options.model_binding) {
            this.listenTo(this.model, 'change', this.fillItems);
        }
    },

    delegateFormItem: function(eventName, selector, listener, options) {
        var opts = options || {};
        this.$el.on(eventName + '.formEvents' + this.cid, selector, opts, listener);
    },

    undelegateFormEvents: function() {
        if (this.$el) {
            this.$el.off('.formEvents' + this.cid);
        }
        _.each(this.schema, _.bind(function(item, key) {
            if (item.validate) {
                this.stopListening(this.model, 'change:'+key, this.errorItem);
            }
        }, this));
        this.stopListening(this.model, 'change', this.fillItems);
        this.stopListening(this.model, 'invalid', this._invalid);
        return this;
    },

    delegateEvents: function(events) {
        this._delegateDOMEvents(events);
        // delegate automatically form events
        this.delegateFormEvents();
        this.bindEntityEvents(this.model, this.getOption('modelEvents'));
        this.bindEntityEvents(this.collection, this.getOption('collectionEvents'));
        return this;
    },

    undelegateEvents: function() {
        var args = Array.prototype.slice.call(arguments);
        Backbone.View.prototype.undelegateEvents.apply(this, args);
        // undelegate automatically form events
        this.undelegateFormEvents();
        this.unbindEntityEvents(this.model, this.getOption('modelEvents'));
        this.unbindEntityEvents(this.collection, this.getOption('collectionEvents'));
        return this;
    },

    fillItems: function(model, value, options) {
        if (_.isEmpty(model.changed) || !this.options.model_binding) {
            return;
        }

        for(var key in model.changed) {
            if (_.has(this.ui, key)) {
                var $item = this.ui[key],
                    val = model.changed[key];

                switch ($item.attr('type')) {
                    case 'radio':
                        var $filtered = $item.filter('[value='+val+']');
                        if ($filtered.prop('checked') !== true) {
                            $filtered.prop('checked', true);
                        }
                        break;
                    case 'checkbox':
                        if ($item.prop('checked') !== Boolean(val)) {
                            $item.prop('checked', Boolean(val));
                        }
                        break;
                    default:
                        if ($item.val() !== val) {
                            $item.val(val);
                        }
                    break;
                }

                if ($item.is('select') && !_.isUndefined($item.select2)) {
                    $item.select2('val', val);
                }
            }
        }
    },

    saveItem: function(event) {
        var options = event.data || null, val;
        if (_.isNull(options)) {
            return;
        }
        //this.schema[options.key].valid = true;
        this.isValid();
        this.ui[options.key].removeClass('invalid');

        switch(options.type) {
            case 'checkbox':
                val = this.ui[options.key].is(':checked');
                break;
            case 'radio':
                val =  this.ui[options.key].filter(':checked').val();
                break;
            default:
                val =  this.ui[options.key].val();
                break;
        }

        this.model.set(options.key, val, options);
    },

    errorItem: function(options) {
        if (_.isUndefined(options) || _.isEmpty(options) || !_.has(this.ui, options.key)) {
            return;
        }
        this._invalid();
        this.ui[options.key].addClass('invalid');
    },

    saveAll: function() {
        _.each(this.schema, _.bind(function(_item, key) {
            var item = _.extend(_.clone(this.defaultSchema), _item);
            item.key = key;
            this.saveItem({
                data: item
            });
        },this));
    },

    isValid: function() {
        for(var key in this.schema) {
            if (!this.schema[key].valid) {
                this._invalid();
                return false;
            }
        }
        this._valid();
        return true;
    },

    _invalid: function() {
        this.$el.removeClass('valid').addClass('invalid');
        this.invalid();
    },

    _valid: function() {
        this.$el.removeClass('invalid').addClass('valid');
        this.valid();
    },

    invalid: function() {
    },

    valid: function() {
    }

});
})(window || global || this);
//# sourceMappingURL=marionette-forms.js.map