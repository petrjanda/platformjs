require.paths.unshift(__dirname + "/lib");

var sys = require('sys');

var	PlatformJS = require('server'),
	connect = require('connect/index');

var server = connect.createServer(
	connect.staticProvider({root: './public'})
);

var platformjs = new PlatformJS(server);

var port = process.argv[2] == "-p" ? process.argv[3] : 8000;
// start webserver listening for new requests
server.listen(port);

sys.puts('=> HTTP server started on port ' + port);