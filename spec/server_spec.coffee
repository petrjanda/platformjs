path	= require 'path'
http	= require 'http'
tobi	= require 'tobi'

require.paths.unshift(require('path').resolve(__dirname, '../lib/'));

Server = require '../src/server'


describe "Server", ->
	beforeEach ->
		@http = http.createServer()
		@server = new Server()
		@server.listen(@http)
		
	it "should have server", ->
		expect(@server.server).toBe(@http)
		
	it "should have client list", ->
		expect(@server.clients).not.toBeUndefined()
		
	describe "connection", ->
		it "should be accepted for ws:// protocol", ->
			expect(false).toBeTruthy()
	
  