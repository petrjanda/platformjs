require './spec_helper'

Client	= require 'client'
sys		= require 'sys'
net		= require 'net'

describe "Client", ->
	beforeEach ->
		@socket = new net.Socket({fd: 9, type: 'tcp4', allowHalfOpen: true})
		@client = new Client(null, null, @socket)
	
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