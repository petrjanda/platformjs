url			= require 'url'
sys			= require 'sys'
Events		= require 'events' 
Client		= require 'client'
Log			= require 'log'

Clients = module.exports = () ->
	process.EventEmitter.call(this)
	@count = 0

sys.inherits(Clients, Events.EventEmitter)

Clients.prototype.connect = (client) ->
	if client.request.method is "GET" and client.request.headers.upgrade.toLowerCase() is 'websocket' and client.request.headers.connection.toLowerCase() is 'upgrade'
		@list = {} unless @list?
		
		# Dont add new client if its already connected.
		if @list[client.sid]?
			return
		
		@list[client.sid] = client
		@count++

		client.addListener 'data', (client, data) =>
			@emit 'data', client, data
		
		client.addListener 'ready', (client) =>
			console.log Log.greenify('[clients]') + ' new connection'
			@emit 'ready', client
		
		client.handshake()
	else
		client.close()


Clients.prototype.disconnect = (client) ->
	client.close()
	delete @list[client.sid]
	@count--

Clients.prototype.disconnectAll = () ->
	(@list[sid].close()
	delete @list[sid]) for sid of @list
	@count = 0

# ## Broadcast
Clients.prototype.broadcast = (data) ->
	(if @list[sid].state == Client.STATUS_READY
		@list[sid].send(data)) for sid of @list