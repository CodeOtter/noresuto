module.exports = function(RED) {
  RED.nodes.registerType('bob', function bob(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.on('input', function(msg) {
      // Complete stub
      console.log(msg);
      console.log(config);
      node.send(msg);
    });
    this.on('close', function() {
      // Close stub
    });
  });
};