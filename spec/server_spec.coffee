path	= require 'path'
http	= require 'http'
tobi	= require 'tobi'
sys 	= require 'sys'
WebSocket = require('websocket-client').WebSocket

require.paths.unshift(require('path').resolve(__dirname, '../lib/'));

Server 	= require '../src/server'

describe "Server", ->
	beforeEach ->
		@http = http.createServer()
		@server = new Server()
		@server.listen(@http)
		@http.listen(1234)
		
	afterEach ->
		@http.close()
		@server.close()
	
		
	it "should have server", ->
		expect(@server.server).toBe(@http)
		
	it "should have client list", ->
		expect(@server.clients).not.toBeUndefined()
		
	describe "server", ->
		it "should be connection with ws:// protocol", ->
			spyOn(@server.clients, 'connect')
			runs () =>
				@ws = new WebSocket 'ws://localhost:1234'
			
			waits 1000

			runs () =>
				expect(@server.clients.connect).toHaveBeenCalled()
