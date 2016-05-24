require('colors');
var RED = require('node-red');
var events = require('node-red/red/runtime/events');
var express = require('express');
var http = require('http');
var pkg = require('../package.json');
var fs = require('fs');
var path = require('path');
var os = require('os');
var noop = function() {};

var app = express();
var server = http.createServer(app);

/**
 * Scans a directory for axiomatic containers of business logic and loads them into the global scope.
 * @param   String    Directory name
 */
function loadAxioms(dir) {
  fs.readdirSync(path.join(__dirname, dir)).forEach(function(file) {
    var name = file.substr(0, file.length - 3);
    if(dir === 'services' && file === 'CrudService') {
      return;
    }

    global[name] = require('./' + dir + '/' + file);
  });
}

// Load axiomatic helpers
global.Environment = process.env.NODE_ENV || 'development';
global.CrudService = require('./services/CrudService');
global.Config = require('./config.js');
global._ = require('lodash');
global.async = require('async');

loadAxioms('models');
loadAxioms('services');
loadAxioms('utils');

// Activate assocations and routes
require('./associations');

RED.init(server, Config.nodeRed);

// Serve the editor UI from /red
app.use(Config.nodeRed.httpAdminRoot, RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(Config.nodeRed.httpNodeRoot, RED.httpNode);

DatabaseService.sync({ 
  force: Config.database.rebuild || false
}).then(function() {
  server.listen(Config.nodeRed.uiPort);

  // Start the runtime
  RED.start();

  events.on('nodes-started', function() {
  });
})['catch'](function() {
  RED.error('Could not sync the database!');
});
