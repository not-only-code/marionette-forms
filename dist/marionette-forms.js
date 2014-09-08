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
var FormView = Backbone.Marionette.View.extend({

    defaultSchema: {
        ui: null,
        event: null,
        validate: false,
        type: 'text',
        message: 'invalid field'
    },

    delegateFormEvents: function() {

        if (_.isEmpty(this.schema) || !this.$el) {
            return;
        }

        if (_.isUndefined(this.ui)) {
            this.ui = {};
        }

        if (_.isUndefined(this.model)) {
            this.model = new Backbone.Marionette.FormModel();
        }

        _.each(this.schema, _.bind(function(_item, key) {

            var item = _.extend(_.clone(this.defaultSchema), _item);
            item.key = key;

            if (_.isNull(item.ui) || _.isNull(item.event)) {
                return;
            }

            this.ui[key] = this.$el.find(item.ui);
            this.delegate(item.event, item.ui, _.bind(this.saveItem, this), item);
            if (item.validate) {
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
        var options = event.data || null;
        if (_.isNull(options)) {
            return;
        }
        this.valid();
        this.ui[options.key].removeClass('error');
        this.model.set(options.key, this.ui[options.key].val(), options);
    },

    errorItem: function(options) {
        if (!options || _.isEmpty(options) || !this.ui[options.key]) {
            return;
        }
        this.ui[options.key].addClass('error');
    },

    invalid: function() {
        // override this function
    },

    valid: function() {
        // override this function
    }

});

Backbone.Marionette.FormView = FormView;
})(window || global || this);
//# sourceMappingURL=marionette-forms.js.map