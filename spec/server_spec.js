require.paths.unshift(__dirname + "../lib");

var	PlatformJS = require('server'),
	connect = require('connect/index'),
	WebSocket = require('websocket').WebSocket,
	sys = require('sys');

describe("server", function() {
	
	var platformjs = new PlatformJS(server);
	var server = connect.createServer();
	
	server.listen(8000);
	
	beforeEach(function() {
		platformjs.listen(server);
	});
	
	afterEach(function() {
		platformjs.close();
	});
	
	describe("components", function() {
		
		it("should have client manager", function() {
			expect(platformjs.clients).toBeDefined();
		});
		
		it("should have channels manager", function() {
			expect(platformjs.channels).toBeDefined();
		});
		
		it("should have storage manager", function() {
			expect(platformjs.storage).toBeDefined();
		})
		
	})
	
	describe("client", function() {

		it("should be able to connect", function() {
			var client = new WebSocket('ws://localhost:8000/');
			var size = 0;
			
			waitsFor(function() {
			    var key;
				for (key in platformjs.clients.clients)
				    if(platformjs.clients.clients.hasOwnProperty(key)) size++;
				return size > 0;
			}, "Client didn't connect!", 1000);
			
			expect(true).toBeTruthy();
		});
	});
	
	describe("hooks", function () {

		it("should be prepared after server start", function() {
			expect(server._events.upgrade).toBeDefined();
		});
	});
});