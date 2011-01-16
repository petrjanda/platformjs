require('./init');

var tobi = require('tobi')
  , server = require('express').createServer()
  , platformjs = require('platformjs').createServer()
  , browser = tobi.createBrowser(80, 'localhost')
  , sys = require('sys');

server.listen(8000);
platformjs.listen(server);

module.exports = {
	
	'client should connect to the server': function() {
		browser.get('/', function(res, $) {
			sys.puts(sys.inspect(res));
		})
	}
}
