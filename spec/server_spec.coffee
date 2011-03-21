require './spec_helper'

http	= require 'http'
Server 	= require 'server'
WebSocket = require('websocket-client').WebSocket

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
		
	describe "connection", ->
		it "should be done with ws:// protocol", ->
			spyOn @server.clients, 'connect'

			runs () =>
				@ws = new WebSocket 'ws://localhost:1234'
			
			waits 1000

			runs () =>
				expect(@server.clients.connect).toHaveBeenCalled()
	
	describe "close", ->
		it "should remove upgrade event listener", ->
			spyOn @http, 'removeAllListeners'
			
			@server.close()
			expect(@http.removeAllListeners).toHaveBeenCalledWith('upgrade')
	  	
	
