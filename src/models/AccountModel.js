var Sequelize = require('sequelize');

module.exports = DatabaseService.define('account', {
  id: {
    type: Sequelize.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: true,
    validate: {}
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {}
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {}
  }
}, {
  freezeTableName: true,
  timestamps: true,
  paranoid: true,
  getterMethods: {},
  setterMethods: {},
  classMethods: {

  },
  instanceMethods: {},
  indexes: [],
  defaultScope: {}, // Applied to all queries
  scopes: {}, // Applied manually via .scope(),
  hooks: {
    beforeBulkCreate: function(instances, options, next) { next(); },
    beforeBulkDestroy: function(instances, next) { next(); },
    beforeBulkUpdate: function(instances, next) { next(); },
    beforeValidate: function(instance, options, next) { next(); },
    afterValidate: function(instance, options, next) { next(); },
    beforeCreate: function(instance, options, next) { next(); },
    beforeDestroy: function(instance, options, next) { next(); },
    beforeUpdate: function(instance, options, next) { next(); },
    afterCreate: function(instance, options, next) { next(); },
    afterDestroy: function(instance, options, next) { next(); },
    afterUpdate: function(instance, options, next) { next(); },
    afterBulkCreate: function(instances, options, next) { next(); },
    afterBulkDestroy: function(instances, next) { next(); },
    afterBulkUpdate: function(instances, next) { next(); }
  }
});