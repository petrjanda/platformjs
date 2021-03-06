require './spec_helper'

Client	= require 'client'
sys		= require 'sys'
net		= require 'net'
buffer	= require 'buffer'
http	= require 'http'
Server 	= require 'server'
WebSocket = require('websocket-client').WebSocket

describe "Client", ->
	beforeEach ->
		@socket = 
			setTimeout: () ->
			setEncoding: () ->
			setKeepAlive: () ->
			on: () ->
			write: () ->
			writable: true
		@request = 
			headers:
				'sec-websocket-key1': ",  3524 2h  70M U|580   . t?[T"
				'sec-websocket-key2': "g299681m859\\  8"
				origin: "localhost"
				host: "localhost"
			socket: @socket
		@head = new buffer.Buffer(['\x00','\x00','\x00','\x00','\x00','\x00','\x00','\x00'])
			
		@client = new Client("", @request, @socket, @head)
		@client.head = @head
	
	it "should be valid", ->
		expect(@client).toBeDefined()
	
	describe "dataHandler", ->
		xit "should set status to CLOSING if data is empty", ->

	describe "send", ->
		it "should not write to socket if client is not in READY state", ->
			@client.state = Client.STATUS_HANDSHAKING
			spyOn @client, 'write'
			@client.send("data")
			expect(@client.write).not.toHaveBeenCalled()
			
		describe "for client in READY state", ->
			beforeEach ->
				@client.state = Client.STATUS_READY
				spyOn @client, 'write'
				@client.send("data")
				
			it "should call write with 0x00", ->
				expect(@client.write).toHaveBeenCalledWith('\x00', 'binary')
				
			it "should call write with data", ->
				expect(@client.write).toHaveBeenCalledWith("data", "utf8")
				
			it "should call write with 0xFF", ->
				expect(@client.write).toHaveBeenCalledWith('\xff', 'binary')
				
	describe "write", ->
		xit "should throw error if socket is not writable", ->
			expect(@client.write).toThrow("Client socket not writable!")
			
		it "should call socket.write if its writable", ->
			spyOn @client.socket, 'write'
			@client.write('data', 'utf8')
			expect(@client.socket.write).toHaveBeenCalledWith('data', 'utf8')
			
		xit "should call", ->
			spyOn(@client.socket, 'write').andThrow(new Error())
			expect(@client.write).toThrow(new Error("Client error writing to socket"))
			
	describe "close", ->
		describe "when READY", ->
			beforeEach ->
				@client.state = Client.STATUS_READY
			
			it "should write empty packet", ->
				spyOn @client, 'write'
				@client.close()
				expect(@client.write).toHaveBeenCalledWith('\xff\x00', 'binary')
				
		describe "when not READY", ->
			it "should not write empty packet", ->
				spyOn @client, 'write'
				@client.close()
				expect(@client.write).not.toHaveBeenCalled()

			
	describe "handshake", ->
		beforeEach ->
			@http = http.createServer()
			@server = new Server()
			@server.listen(@http)
			@http.listen(1234)
		
		afterEach ->
			@http.close()
			@server.close()

		xit "should return valid handshake response", ->
			runs () =>
				@ws = new WebSocket 'ws://localhost:1234'
				expect(@ws.readyState).toEqual 0
		
			waits 1500

			runs () =>
				expect(@ws.readyState).toEqual 1
			
	describe "getVersion", ->
		it "should return 76", ->
			expect(@client.getVersion()).toEqual("76")
			
	describe "getOrigin", ->
		it "should return request origin", ->
			expect(@client.getOrigin()).toEqual("localhost")
			
	describe "getLocation", ->
		describe "with wrong request headers", ->
			beforeEach ->
				@client.request.headers.host = null
			
			it "should return undefined", ->
				expect(@client.getLocation(@client.request)).toEqual(undefined)
		
		describe "with valid headers", ->
			it "should return valid location", ->
				expect(@client.getLocation(@client.request)).toEqual('ws://localhost')

		describe "with valid headers and port", ->
			beforeEach ->
				@client.request.headers.host = "localhost:8000"
			
			it "should return valid location with port", ->
				expect(@client.getLocation(@client.request)).toEqual('ws://localhost:8000')
			
		describe "with valid headers and secure socket", ->
			beforeEach ->
				@client.request.socket.secure = true

			it "should return location starting with wss://", ->
				expect(@client.getLocation(@client.request)).toEqual('wss://localhost')