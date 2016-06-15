require('colors');
var program = require('commander');
var RED = require('node-red');
var events = require('node-red/red/runtime/events');
var express = require('express');
var http = require('http');
var pkg = require('../package.json');
var fs = require('fs');
var path = require('path');
var os = require('os');
var noop = function() {};

program.
  version(pkg.version).
  option('--newNode [config]', 'Generate a node with a specified JSON configuration').
  option('--prod', 'Run Redweb in production.').
  //option('--rebuild', 'Rebuild the database').
  //option('--port [number]', 'Port to run the server on.  Default is 8880').
  parse(process.argv);

if(program.prod) {
  program.environment = 'production';
} else {
  program.environment = 'development';
}

if(program.newNode) {
  // Generate a new node

  var generator = require('./utils/generator');

  try {
    var newNodeConfig = JSON.parse(program.newNode);
  } catch(e) {
    console.error('JSON configuration for new node incorrectly formed.');
    process.exit(1);
  }

  if(!newNodeConfig.name) {
    console.error('JSON configuration for new node incorrectly formed.');
    process.exit(1); 
  }

  generator(newNodeConfig.name, 
    newNodeConfig.description || '', 
    newNodeConfig.category || '', 
    newNodeConfig.color || '',
    {},
    newNodeConfig.inputs || 1, 
    newNodeConfig.outputs || 1, 
    newNodeConfig.icon || '', 
    function() {
      console.error('Node created!');
      process.exit(0); 
    },
    function(err) {
      console.error(err);
      process.exit(1); 
    });
} else {
  // Start the server
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
  global.Environment = process.env.NODE_ENV || program.environment;
  global.CrudService = require('./services/CrudService');
  global.Config = require('./config.js');
  global._ = require('lodash');
  global.async = require('async');

  loadAxioms('services');
  loadAxioms('models');
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
}
