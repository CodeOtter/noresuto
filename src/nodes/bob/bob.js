module.exports = function(RED) {
  RED.nodes.registerType('bob', function bob(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.on('input', function(msg) {
      // Complete stub
      node.send(msg);
    });
    this.on('close', function() {
      // Close stub
    });
  });
};