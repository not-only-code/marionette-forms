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

    validationTypes: ['email', 'text', 'number', 'url', 'regexp'],

    validate: function(attributes, options) {
        console.log(options.type);
    }

});

Backbone.Marionette.FormModel = FormModel;
var FormView = Backbone.Marionette.ItemView.extend({

    defaultSchema: {
        ui: null,
        event: null,
        required: false,
        type: 'text',
        message: 'invalid field'
    },

    bindSchema: function() {

        if (_.isEmpty(this.schema)) {
            return;
        }

        if (_.isUndefined(this.ui)) {
            this.ui = {};
        }

        if (_.isUndefined(this.model)) {
            this.model = new Backbone.Marionette.FormModel();
        }

        this.undelegateEvents();

        _.each(this.schema, _.bind(function(_item, key) {

            var item = _.extend(_.clone(this.defaultSchema), _item);
            item.key = key;

            if (_.isNull(item.ui) || _.isNull(item.event)) {
                return;
            }

            this.ui[key] = this.$el.find(item.ui);
            this.delegate(item.event, item.ui, _.bind(this.saveItem, this), item);
            if (item.required) {
                this.listenTo(this.model, 'validate:'+key, this.errorItem);
            }

        }, this));
    },

    delegate: function(eventName, selector, listener, options) {
        this.$el.on(eventName + '.delegateEvents' + this.cid, selector, options, listener);
    },

    saveItem: function(event) {
        if (!event.data || _.isEmpty(event.data)) {
            return;
        }
        this.model.set(event.data.key, this.ui[event.data.key].val(), {validate: event.data.required, type: event.data.type});
    },

    errorItem: function(key, message) {
        console.log('validating response.....', message);
    }

});

Backbone.Marionette.FormView = FormView;
})(window || global || this);
//# sourceMappingURL=marionette-forms.js.map