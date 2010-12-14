require.paths.unshift(__dirname + "/lib");

var	PlatformJS = require('server'),
	connect = require('connect/index');

var server = connect.createServer(
	connect.staticProvider({root: './public'})
);

var platformjs = new PlatformJS(server);

// start webserver listening for new requests
server.listen(8000);