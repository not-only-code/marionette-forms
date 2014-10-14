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

        Backbone.Marionette.View.apply(this, arguments);

        if (_.isEmpty(this.schema)) {
            throw new Error("FormView instance has empty schema");
        }

        return this;
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

            this.ui[key] = this.$el.find(item.ui);
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