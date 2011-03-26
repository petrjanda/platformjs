require './spec_helper'

Client	= require 'client'
sys		= require 'sys'
net		= require 'net'
http	= require 'http'
buffer	= require 'buffer'

describe "Client", ->
	beforeEach ->
		@socket = new net.Socket({fd: 9, type: 'tcp4', allowHalfOpen: true})
		@request = 
			headers:
				'sec-websocket-key1': "18x 6]8vM;54 *(5:  {   U1]8  z [  8"
				'sec-websocket-key2': "1_ tx7X d  <  nw  334J702) 7]o}` 0"
				origin: "localhost"
		@head = new buffer.Buffer(8)
			
		@client = new Client("", @request, @socket, @head)
	
	it "should be valid", ->
		expect(@client).toBeDefined()
	
	describe "dataHandler", ->
		it "should set status to CLOSING if data is empty", ->

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
		it "should return valid handshake response", ->
			spyOn(@client, 'getLocation').andReturn('ws://localhost:8000/')
			spyOn(@client, 'write')
			@client.handshake()
			expect(@client.write).toHaveBeenCalled()
			# With("HTTP/1.1 101 WebSocket Protocol Handshake\r\nUpgrade: WebSocket\r\nConnection: Upgrade\r\nSec-WebSocket-Origin: null\r\nSec-WebSocket-Location: ws://localhost:8000/\r\n\r\np$|º¾uhåÈn") # fQJ,fN/4F4!~K~MH
			
			
	describe "getVersion", ->
		it "should return 76", ->
			expect(@client.getVersion()).toEqual("76")
			
	describe "getOrigin", ->
		it "should return request origin", ->
			expect(@client.getOrigin()).toEqual("localhost")
			
	describe "getLocation", ->
		it "should return request location", ->
			
			
