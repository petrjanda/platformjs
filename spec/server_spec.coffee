require './spec_helper'

http	= require 'http'
Server 	= require 'server'
Buffer	= require('buffer').Buffer
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
		beforeEach ->
			@socket = 
				setTimeout: () ->
				setEncoding: () ->
				setKeepAlive: () ->
				on: () ->
			@head = new Buffer(8)
			@request = {}
		
		it "should be done with ws:// protocol", ->
			spyOn @server.clients, 'connect'	
			@http.emit('upgrade', @request, @socket, @head)
			expect(@server.clients.connect).toHaveBeenCalled()
				
	it "should call broadcast on client data", ->
		spyOn @server.clients, 'broadcast'
		@server.clients.emit('data', {sid:""}, "Message")
		expect(@server.clients.broadcast).toHaveBeenCalledWith("Message")
	
	describe "close", ->
		it "should remove upgrade event listener", ->
			spyOn @http, 'removeAllListeners'
			
			@server.close()
			expect(@http.removeAllListeners).toHaveBeenCalledWith('upgrade')
	  	
	
