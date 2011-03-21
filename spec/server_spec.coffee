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
	
		
	it "should have server", ->
		expect(@server.server).toBe(@http)
		
	it "should have client list", ->
		expect(@server.clients).not.toBeUndefined()
		
	describe "connection", ->
		it "should be accepted for ws:// protocol", ->
  			ws = new WebSocket('ws://localhost:1234', 'borf');
			console.log(WebSocket)
			#ws.on 'data', (buf) ->
			#	console.log 'Got data: ' + buf

			#ws.onmessage = (m) ->
			#    console.log 'Got message: ' + m