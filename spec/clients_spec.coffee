path	= require 'path'
sys		= require 'sys'

require.paths.unshift(require('path').resolve(__dirname, '../lib/'));

Clients = require '../src/clients'

describe "Clients", ->
	beforeEach ->
		@clients = new Clients()
		
		# Mock the client
		@client =
			sid: 123
			request:
				method: 'GET'
				headers: 
					upgrade: 'WebSocket'
					connection: 'Upgrade'
					host: 'localhost:8000'
					origin: 'null'
					'sec-websocket-key1': '38b01/4z3y;\\S  56H   5^ 9Qz l'
					'sec-websocket-key2': '3Y05g9S:HvN374 39o3-;'
			close: () ->
			addListener: () ->
			handshake: () ->
				
	describe "client count", ->
		it "should be 1", ->
			@clients.connect(@client)
			expect(@clients.count).toBe(1)
			
		it "should be 0", ->
			@clients.connect(@client)
			@count = @clients.count
			
			@clients.disconnect(@client)
			expect(@clients.count).toBe(@count - 1)
			
		it "should not count one client twice", ->
			@clients.connect(@client)
			@clients.connect(@client)
			expect(@clients.count).toBe(1)

	describe "connect", ->
		describe "with valid request headers", ->
			it "should start handshake", ->
				spyOn @client, 'handshake'
				@clients.connect(@client)
				expect(@client.handshake).toHaveBeenCalled()
			  
			it "should add listers to client", ->
				s = spyOn @client, 'addListener'
				@clients.connect(@client)
				expect(@client.addListener).toHaveBeenCalled()
				expect(s.callCount).toBe(2)
			
			it "should not call close ", ->
				spyOn @client, 'close'
				@clients.connect(@client)
				expect(@client.close).not.toHaveBeenCalled()
				
			it "should store client", ->
				@clients.connect(@client)
				expect(@clients.list[@client.sid]).toBe(@client)

		describe "with invalid request method", ->
			it "should call close", ->
				@client.request.method = 'POST'
				spyOn @client, 'close'
				@clients.connect(@client)
				expect(@client.close).toHaveBeenCalled()

		

	describe "disconnect", ->
		beforeEach ->
			@clients.connect(@client)
		
		it "should close the client", ->
			spyOn @client, 'close'
			@clients.disconnect(@client)
			expect(@client.close).toHaveBeenCalled()
			
		it "should delete client from list", ->
			@clients.disconnect(@client)
			expect(@clients.list[@client.sid]).not.toBeDefined()
			
	describe "diconnectAll", ->
		beforeEach ->
			@clients.connect(@client)
			
		it "should close all clients", ->
			spyOn @client, 'close'
			@clients.disconnectAll()
			expect(@client.close).toHaveBeenCalled()
			
		it "client count should be 0", ->
			@clients.disconnectAll()
			expect(@clients.count).toEqual(0)
			
		it "clients should be empty", ->
			@clients.disconnectAll()
			expect(@clients.list).toEqual({})
		
		
	describe "broadcast", ->
	  