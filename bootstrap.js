require.paths.unshift(__dirname + "/lib");
require.paths.unshift(__dirname + "/deps");
require.paths.unshift(__dirname + "/deps/express/support/connect/lib")

var sys = require('sys');

var	PlatformJS = require('server'),
	express = require('express/lib/express');
	
var server = express.createServer(),
	platformjs = new PlatformJS(server);

server.use(express.staticProvider(__dirname + '/public'));

var port = process.argv[2] == "-p" ? process.argv[3] : 8000;

// start webserver listening for new requests
server.listen(port);

sys.puts('=> HTTP server started on port ' + port);