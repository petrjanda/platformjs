# PlatformJS server for real-time websocket protocol based communication. 
# Its designed to work in both cases as standalone server or to be attached
# to other already existing HTTP server based on http.createServer() like
# express.
#

url 		= require 'url' 
net 		= require 'net' 	
sys 		= require 'sys' 	
http 		= require 'http' 
connect 	= require 'connect' 
utils 		= connect.utils
	
Client		= require './client'
Clients 	= require './clients'
Log			= require './log'
Events		= require 'events'

# ## Global exceptions handling
# 
# All exception raised in the application, which are not caught by try blocks
# are being catched here. 
#
process.on 'uncaughtException', (err) ->
	console.log 'Caught uncaughtException: ' + err.stack

Server = module.exports = (options) ->

	@config = options || {
		verbose: false
	}
	
	@clients = new Clients()
	@server = null
	
	if @config.verbose
		Log.enabled = true
		
	return
	
sys.inherits Server, Events.EventEmitter

# ## Listen
#
# Function to start server listening for new ws:// protocol connections. As soon as
# server 'upgrade' event is emited client object is created and stored in internal 
# server list. Regular requests over http:// family protocols are not affected and
# handled by HTTP server as usual without PlatformJS server.
#
Server.prototype.listen = (server) ->

	unless server?
		server = http.createServer (req, res) ->
			res.writeHead(200, {'Content-Type': 'text/plain'})
			res.end()
			
		server.listen(8000)

	@server = server

	server.on 'upgrade', (request, socket, head) =>
		@clients.connect(new Client(utils.uid(), request, socket, head))
	
	@clients.on 'data', (client, data) =>
		Log.info 'server', 'sid=' + client.sid + ' Message received'
		@emit 'message', data, client
		
	@clients.on 'ready', (client) =>
		Log.info 'server', 'Client #' + client.sid + ' connected'
		@emit 'connection', client
	
	Log.info 'platformjs', 'Started'

# ## Close
#
# Close the PlatformJS server by disconnecting all clients and removing the 'upgrade'
# listener. Webserver itself is not affected at all and continue to work.
#
Server.prototype.close = () ->
	@server.removeAllListeners 'upgrade'
	Log.info 'platformjs', 'Closed'

