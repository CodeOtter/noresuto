module.exports = function(Model) {
  return {

    beforeCreate: function(values, next, error) { next(values); },
    afterCreate: function(values, record, next, error) { next(record); },
    beforeUpdate: function(criteria, values, next, error) { next(criteria, values); },
    afterUpdate: function(criteria, record, next, error) { next(record); },
    beforeArchive: function(criteria, next, error) { next(criteria); },
    afterArchive: function(criteria, record, next, error) { next(record); },
    beforeSearch: function(criteria, next, error) { next(criteria); },
    afterSearch: function(criteria, records, next, error) { next(records); },
    beforeGet: function(criteria, next, error) { next(criteria); },
    afterGet: function(criteria, record, next, error) { next(record); },
    beforeDestroy: function(criteria, next, error) { next(criteria); },
    afterDestroy: function(result, next, error) { next(result); },

    /**
     *
     */
    append: function(addition, source, success, error) {
      addition(source).then(success)['catch'](error);
    },

    /**
     *
     */
    create: function(values, success, error) {
      var self = this;
      this.beforeCreate(values, function(values) {
        Model.create(values).then(function(record) {
          self.afterCreate(values, record, success, error);
        })['catch'](error);
      }, error);
    },

    /**
     *
     */
    update: function(criteria, values, success, error) {
      var self = this;
        this.beforeUpdate(criteria, values, function(criteria, values) {
        Model.update(values, { where: criteria }).then(function(record) {
          self.afterUpdate(criteria, record, success, error);
        })['catch'](error);
      }, error);
    },
    
    /**
     *
     */
    search: function(criteria, success, error) {
      var self = this;
      this.beforeSearch(criteria, function(values) {
        Model.findAll({ where: criteria }).then(function(records) {
          self.afterSearch(criteria, records, success, error);
        })['catch'](error);
      }, error);
    },

    /**
     *
     */
    get: function(criteria, success, error) {
      var self = this;
      this.beforeGet(criteria, function(values) {
        Model.findOne({ where: criteria }).then(function(record) {
          self.afterGet(criteria, record, success, error);
        })['catch'](error);
      }, error);
    },

    /**
     *
     */
    destroy: function(criteria, success, error) {
      var self = this;
      this.beforeDestroy(criteria, function(values) {
        Model.destroy({ where: criteria }).then(function(result) {
          self.afterDestroy(result, success, error);
        })['catch'](error);
      }, error);
    }
  };
};