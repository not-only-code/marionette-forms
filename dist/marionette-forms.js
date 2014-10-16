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
    // validar cada tipo de datos lanzando un evento

    validations: {
        email: /^[\w\-]{1,}([\w\-\+.]{1,1}[\w\-]{1,}){0,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/,
        url: /^(http|https):\/\/(([A-Z0-9][A-Z0-9_\-]*)(\.[A-Z0-9][A-Z0-9_\-]*)+)(:(\d+))?\/?/i,
        number: /^[0-9]*\.?[0-9]*?$/,
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
            console.log(input);
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
Backbone.Marionette.FormView = Backbone.Marionette.View.extend({

    defaultSchema: {
        ui: null,
        event: null,
        validate: true,
        type: 'text',
        message: 'invalid field'
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

        return this;
    },

    addSchemaElements: function() {
        _.each(this.schema, _.bind(function(item, key){
            if (_.has(item, 'ui') && !_.isEmpty(item.ui)) {
                this.ui[key] = item.ui;
            }
        }, this));
    },

    delegateFormEvents: function() {

        if (!this.$el) {
            return;
        }

        _.each(this.schema, _.bind(function(_item, key) {

            var item = _.extend(_.clone(this.defaultSchema), _item);
            item.key = key;

            if (_.isNull(item.ui) || _.isNull(item.event)) {
                return;
            }

            if (!_.has(this.ui, key)) {
                this.ui[key] = this.$el.find(item.ui);
            }
            this.delegate(item.event, item.ui, _.bind(this.saveItem, this), item);

            if (item.validate) {
                this.ui[key].addClass('required');
                this.listenTo(this.model, 'invalid:'+key, this.errorItem);
            }

        }, this));

        this.listenTo(this.model, 'invalid', this.invalid);
    },

    delegate: function(eventName, selector, listener, options) {
        var opts = options || {};
        this.$el.on(eventName + '.formEvents' + this.cid, selector, opts, listener);
    },

    undelegateFormEvents: function() {
        if (this.$el) {
            this.$el.off('.formEvents' + this.cid);
        }
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

    saveItem: function(event) {
        var options = event.data || null, val;
        if (_.isNull(options)) {
            return;
        }
        this.valid();
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
        if (!options || _.isEmpty(options) || !this.ui[options.key]) {
            return;
        }
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

    invalid: function() {
        this.isValid = false;
    },

    valid: function() {
        this.isValid = true;
    }

});
})(window || global || this);
//# sourceMappingURL=marionette-forms.js.map