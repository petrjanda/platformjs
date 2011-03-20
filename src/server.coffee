url 		= require 'url' 
net 		= require 'net' 	
sys 		= require 'sys' 	
http 		= require 'http' 
connect 	= require 'connect' 
utils 		= connect.utils
	
Client		= require './client'
Clients 	= require './clients'

# ## Global exceptions handling
# 
# All exception raised in the application, which are not caught by try blocks
# are being catched here. 
#
process.on 'uncaughtException', (err) ->
	console.log 'Caught uncaughtException: ' + err.stack

# # PlatformJS Server
#
# PlatformJS is HTTP server module for real-time communication using 
# the WebSocket protocol. Its properly designed to be able to cooperate
# on top of the regular HTTP server instance based on express, connect 
# or any other standard HTTP node.js server.
#
Server = module.exports = () ->
	@clients = new Clients()
	@server = null

# # Listen
#
# Start listening for websocket connections. The server is started to work
# on top of the regular HTTP server. Only ws:// requrests are handled here, rest of
# them goes through.
#
# If the new upgrade event on the server instance is emited, we detect the connection 
# coming, generate the unique session ID and bypass all request data so client can 
# be handshaked and then connected to the server.
#
Server.prototype.listen = (server) ->
	@server = server
	
	server.on 'upgrade', (request, socket, head) ->
		self.clients.connect(new Client(utils.uid(), request, socket, head))
	

# # Close
#
# Close method is responsible to shut down the server and detatch it from the webserver.
# It closes all the connection with clients actually connected and remove the event listener
# so the instance no longer retrieve any connect calls.
#
Server.prototype.close = () ->
	@channels.destroyAll()
	@server.removeAllListeners 'upgrade'
