require.paths.unshift(__dirname + "../lib");

var	PlatformJS = require('server'),
	connect = require('connect/index'),
	WebSocket = require('websocket').WebSocket,
	sys = require('sys');

describe("Server", function() {
	
	var platformjs, server;
	
	beforeEach(function() {
		server = connect.createServer();
		server.listen(8000);
		
		platformjs = new PlatformJS(server);
		platformjs.listen(server);
	});
	
	afterEach(function() {
		platformjs.close();
		server.close();
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
	
	describe("channel", function() {
		
		it("should be created if not exists", function() {
			
			var channelsCount = platformjs.channels.count;
			var client = new WebSocket('ws://localhost:8000/channel');

			waitsFor(function() {
			    return platformjs.channels.count > channelsCount;
			}, "channel was not created!", 2000);
			
			runs(function() {
				expect(platformjs.channels.count > channelsCount).toBeTruthy();
			});
		});


		xit("shouldn't be created if exists", function() {

			platformjs.channels.create("/channel");
			expect(platformjs.channels.count == 1).toBeTruthy();
			
			var clientsCount = platformjs.clients.count
			  , channelsCount = platformjs.channels.count;
			
			var client = new WebSocket('ws://localhost:8000/channel');

			waitsFor(function() {
			    return platformjs.clients.count > clientsCount;
			}, "client was not connected!", 2000);
			
			runs(function() {
				expect(platformjs.channels.count > channelsCount).toBeTruthy();
			});
		});

	});
	
	describe("hooks", function () {

		it("should be prepared after server start", function() {
			expect(server._events.upgrade).toBeDefined();
		});
	});
});