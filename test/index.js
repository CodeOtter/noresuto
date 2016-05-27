var _  = require('lodash');
var async = require('async');
var RED = require('node-red');
var events = require('node-red/red/runtime/events');
var express = require('express');
var http = require('http');
var Supertest = require('supertest');
var Jasmine = require('jasmine');
var settings = require('../src/config');

/**
 * Refreshes the supertest cache so that each tester can have their own supertest instance
 */
function createTester() {
  var Supertest = require('supertest');
  var result = Supertest(server);
  delete require.cache[require.resolve('supertest')];
  return result;
}

var suite = {

  /**
   * Converts a plain object of keys and functions and turns them into Jasmine mocks
   * @param   Object
   * @returns Mock
   */
  mock: function(mock) {
    var result = {};
    for(var i in mock) {
      result[i] = jasmine.createSpy(i).and.callFake(mock[i]);
    }
    return mock;
  },

  /**
   *
   */
  actor: function(username, done, error) {
    var tester = createTester();
    tester.post('/accounts').send({
      username: username,
      password: 'test'
    }).end(function(err, account) {
      if(err || account.error) {
        return error(err || account.error);
      }
      return tester.post('/login').send({
        username: username,
        password: 'test'
      }).end(function(err, jwt) {
        if(err || jwt.error) {
          return error(err || jwt.error);
        }
        return done(function(method, uri, values) {
          return tester[method](uri).set('Authorization', 'Bearer ' + jwt.body).send(values);
        }, account);
      });
    });
  }
};

var app = express();
var server = http.createServer(app);
var jasmine = new Jasmine();

jasmine.loadConfigFile('test/config.json');
jasmine.configureDefaultReporter({
    showColors: true,
    captureExceptions: false
});
jasmine.onCompleteCallbackAdded = false;

jasmine.onComplete(function(passed) {
  process.exit(passed ? 0 : 1);
});

RED.init(server, settings.nodeRed);

// Serve the editor UI from /red
app.use(settings.nodeRed.httpAdminRoot, RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.nodeRed.httpNodeRoot, RED.httpNode);

server.listen(settings.nodeRed.testPort);

// Start the runtime
RED.start();

events.on('nodes-started', function() {
  suite.actor('tester', function() {
    jasmine.execute(); 
  });
});

module.exports = suite;