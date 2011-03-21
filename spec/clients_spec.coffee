path	= require 'path'
sys		= require 'sys'

require.paths.unshift(require('path').resolve(__dirname, '../lib/'));

Clients = require '../src/clients'

describe "Clients", ->
	beforeEach ->
		@clients = new Clients()
		
		# Mock the client
		@client =
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
				console.log sys.inspect(@client.request.method)
				@clients.connect(@client)
				expect(@client.close).not.toHaveBeenCalled()

		describe "with invalid request method", ->
			it "should call close", ->
				@client.request.method = 'POST'
				spyOn @client, 'close'
				@clients.connect(@client)
				expect(@client.close).toHaveBeenCalled()

		

	describe "disconnect", ->
	  
	describe "diconnectAll", ->

	describe "broadcast", ->
	  