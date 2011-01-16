require.paths.unshift(__dirname + "../lib");

var	PlatformJS = require('server'),
	connect = require('connect/index'),
	WebSocket = require('websocket').WebSocket,
	sys = require('sys');
	
describe("WebSocket client", function() {

	it("should connect to server", function() {
		var server = connect.createServer();
		var platformjs = new PlatformJS(server);
		
		platformjs.listen(server);
		server.listen(8000);
		
		sys.puts(sys.inspect(platformjs));
		
		var ws = new WebSocket("ws://localhost:8000/channel");
		
		ws.onopen = function() {
			sys.puts("HEY MAN!");
		}
		
		waits(1000);
		
		runs(function() {
		})
		
		waitsFor(function() {
			return ws.readyState == WebSocket.OPEN;
		})
		
		runs(function() {
			expect(ws.readyState == WebSocket.OPEN).toBeTruthy();
		})
	})
});