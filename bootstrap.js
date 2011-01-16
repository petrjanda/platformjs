require.paths.unshift(__dirname + "/lib");
require.paths.unshift(__dirname + "/deps/connect/lib");
require.paths.unshift(__dirname + "/deps/express/lib");

var sys = require('sys');

var	platformjs = require('platformjs'),
	express = require('express');
	
var server = express.createServer(),
	platformServer = platformjs.createServer();

server.use(express.staticProvider(__dirname + '/public'));

var port = process.argv[2] == "-p" ? process.argv[3] : 8000;

// start webserver listening for new requests
server.listen(port);
platformServer.listen(server);

sys.puts('=> HTTP server started on port ' + port);