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