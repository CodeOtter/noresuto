var fs = require('fs');
var handlebars = require('handlebars');

/**
 *
 */
module.exports = function(name, description, category, color, defaults, inputs, outputs, icon, success, error) {

  var directory = __dirname + '/../../nodes/' + name;

  try {
    fs.statSync(directory);
    return error(name + ' node already exists!');
  } catch(e) {}

  var jsFile = fs.readFileSync(__dirname + '/js.hbs').toString();
  var htmlFile = fs.readFileSync(__dirname + '/html.hbs').toString();
  var packageFile = fs.readFileSync(__dirname + '/package.hbs').toString();

  var values = {
    name: name,
    description: description,
    category: category,
    color: color,
    defaults: JSON.stringify(defaults || {}, null, 2),
    inputs: inputs || 1,
    outputs: outputs || 1,
    icon: icon + 'function'
  };

  var jsOutput = handlebars.compile(jsFile)(values);
  var htmlOutput = handlebars.compile(htmlFile)(values);
  var packageOutput = handlebars.compile(packageFile)(values);

  fs.mkdirSync(directory);
  fs.mkdirSync(directory + '/sample');

  fs.writeFileSync(directory + '/' + name + '.js', jsOutput.substr(9, jsOutput.length - 19));
  fs.writeFileSync(directory + '/' + name + '.html', htmlOutput);
  fs.writeFileSync(directory + '/package.json', packageOutput.substr(9, packageOutput.length - 19));

  return success();
};