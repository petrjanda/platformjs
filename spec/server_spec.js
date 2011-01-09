require.paths.unshift(__dirname + "../lib");

var	PlatformJS = require('server'),
	connect = require('connect/index');

describe("Server", function() {
	
	var server = connect.createServer(
		connect.staticProvider({root: './public'})
	);
	
	it("should be able to hook on the server", function() {
		expect(server._events.upgrade).toBeUndefined();
		var platformjs = new PlatformJS(server);
		expect(server._events.upgrade).toBeDefined();
	});
});