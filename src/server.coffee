url 		= require 'url' 
net 		= require 'net' 	
sys 		= require 'sys' 	
http 		= require 'http' 
connect 	= require 'connect' 
utils 		= connect.utils
	
Client		= require './client'
Clients 	= require './clients'
Log			= require './log'

# ## Global exceptions handling
# 
# All exception raised in the application, which are not caught by try blocks
# are being catched here. 
#
process.on 'uncaughtException', (err) ->
	console.log 'Caught uncaughtException: ' + err.stack

# # PlatformJS Server
#
# PlatformJS server for real-time websocket protocol based communication. 
# Its designed to work in both cases as standalone server or to be attached
# to other already existing HTTP server based on http.createServer() like
# express.
#
Server = module.exports = () ->
	@clients = new Clients()
	@server = null

# ## Listen
#
# Function to start server listening for new ws:// protocol connections. As soon as
# server 'upgrade' event is emited client object is created and stored in internal 
# server list. Regular requests over http:// family protocols are not affected and
# handled by HTTP server as usual without PlatformJS server.
#
Server.prototype.listen = (server) ->
	@server = server

	server.on 'upgrade', (request, socket, head) =>
		@clients.connect(new Client(utils.uid(), request, socket, head))
	
	console.log(Log.greenify('[platformjs]') + ' Started')

# ## Close
#
# Close the PlatformJS server by disconnecting all clients and removing the 'upgrade'
# listener. Webserver itself is not affected at all and continue to work.
#
Server.prototype.close = () ->
	@channels.destroyAll()
	@server.removeAllListeners 'upgrade'
