var messages = require('../../messages');

var stores = {};

stores[DatabaseService.config.database] = Object.keys(DatabaseService.models);
stores.woop = ['hey', 'bucko'];

module.exports = function(RED) {
  RED.nodes.registerType('database', function database(config) {
    RED.nodes.createNode(this, config);

    //try {
      // Prepare the query
      this.queryCache = JSON.parse(config.query);
    //} catch(e) {
      // The node is using invalid JSON
      // ?
    //}

    var database = stores[config.databaseName];

    if(!database) {
      //return node.send([null, { error: messages.nodered.invalidDatabase }]);
    }

    this.model = database.models[config.modelName];

    if(!this.model) {
      //return node.send([null, { error: messages.nodered.invalidModelName }]);
    }

    this.field = config.field || 'payload';
    this.fieldType = config.fieldType || 'msg';

    var node = this;

    this.on('input', function(msg) {

      var modelData;

      // Confirm the field is targeting a valid message property
      if (node.fieldType === 'msg') {
          modelData = msg[node.field];
      } else if (node.fieldType === 'flow') {
          modelData = node.context().flow.get(node.field);
      } else if (node.fieldType === 'global') {
          modelData = node.context().global.get(node.field);
      }

      if(!modelData) {
        return node.send([null, { error: messages.nodered.invalidfield }]);
      }

      if(node.queryCache) {
        // Doing an bulk update
        return node.model.
          update(modelData, node.queryCache).
          then(function(result) {
            // Bulk update performed
            // @TODO: Confirm this works right
            msg.payload[node.field] = result;
            node.send([ msg, null ]);
          })['catch'](function(err) {
            // Bulk update failure
            node.send([null, { error: messages.database.updateFailure }]);
          });
      } else {
        // Doing an insert
        return node.model.
          create(modelData).
          then(function(result) {
            // Creation successful
            msg.payload[node.field] = result;
            node.send([ msg, null ]);
          })['catch'](function(err) {
            // Creation failure
            node.send([null, { error: messages.nodered.createFailure }]);
          });
      }
    });

    this.on('close', function() {
      // Close stub
    });
  });

  /**
   * Returns a list of databases and their stores
   */
  RED.httpAdmin.get("/databases", RED.auth.needsPermission('databaseList.read'), function(req,res) {
    res.json(stores);
  });
};


