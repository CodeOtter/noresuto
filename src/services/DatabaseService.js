var RED = require('node-red');
var Sequelize = require('sequelize');
var fs = require('fs');
var settings = Config.database[Config.database.environments[Environment]];

if(settings.dialect === 'sqlite') {
  fs.closeSync(fs.openSync(settings.storage, 'w'));
}

// @TODO: Allow multiple database support

var db = new Sequelize(settings.name, settings.username, settings.password, {
  host: settings.host,
  dialect: settings.dialect,
  pool: settings.pool,
  storage: settings.storage,
  logging: settings.logging === false ? false : RED.log
});

var models = null;

module.exports = db;