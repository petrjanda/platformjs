sys			= require 'sys'
Events		= require 'events'
url			= require 'url'
Crypto		= require 'crypto'
Buffer		= require('buffer').Buffer

# # Client
#
# Client represents one connection to the server. Its created in case new
# connection is coming to server, handshaked and stored in server list in
# case the handshake result is ok.
#
# It has ability to send and retrieve the data to resp. from the client machine.
# It uses client-server websocket protocol version draft75 or draft75.
#
Client = module.exports = (sid, request, socket, head) ->
	process.EventEmitter.call(this)
	
	@request = request
	@socket = socket
	@head = head
	
	@sid = sid

	@state = Client.STATUS_OPENING
	
	# Start listening for client socket data.
	@socket.on 'data', (data) => 
		@dataHandler(data)
	
	# Adjust the head if websocket draft76 is used to connect from client.
	if @getVersion() == "76"
		if @head.length >= 8
			@request.upgradeHead = head.slice(0, 8)
			@firstFrame = head.slice(8, head.length)
		else
			@reject("Missing key3")
	
sys.inherits(Client, Events.EventEmitter)	

# Handler to be called each time incoming data appear in the client socket.
# In case there are only 0xFF and 0x00 bytes, the data frame was empty and 
# the socket is being closed from the client side.
#
# @data [String]	Utf8 data received from the client. 
#
Client.prototype.dataHandler = (data) =>
	if data.length is 2 and data[0] is 0xFF and data[1] is 0x00
		@state = STATUS_CLOSING;
	else
		@emit('data', @, data.substring(1, data.length - 1))

Client.prototype.getVersion = () ->
	"75"
	
# ## Send
#
# Send the data to the client. The frame of data looks like.
#
# 	0x00 ... data them selves in string format ... 0xFF
#
Client.prototype.send = (data) ->
	if @state is Client.STATUS_READY
		try
			@write '\x00', 'binary'
			@write data, 'utf8'
			@write '\xff', 'binary'
		catch e
			sys.log e

# Write data using the specified encoding to the socket.
#
Client.prototype.write = (data, encoding) ->
	unless @socket.writable
		throw new Error 'Client socket not writable!'
		
	try
		@socket.write data, encoding
	catch e 
		throw new Error 'Client error writing to socket' + e
	
#
#
#
Client.prototype.handshake = () ->
	res = null
	location = @getLocation @request

	if location
		res = 'HTTP/1.1 101 WebSocket Protocol Handshake\r\nUpgrade: WebSocket\r\nConnection: Upgrade\r\nSec-WebSocket-Origin: ' + @getOrigin(@request) + '\r\nSec-WebSocket-Location: ' + location

		strkey1 = @request.headers['sec-websocket-key1']
		strkey2 = @request.headers['sec-websocket-key2']

		numkey1 = parseInt strkey1.replace(/[^\d]/g, ""), 10
		numkey2 = parseInt strkey2.replace(/[^\d]/g, ""), 10

		spaces1 = strkey1.replace(/[^\ ]/g, "").length
		spaces2 = strkey2.replace(/[^\ ]/g, "").length

		if spaces1 is 0 or spaces2 is 0 or numkey1 % spaces1 != 0 || numkey2 % spaces2 != 0
			sys.log '[client] WebSocket contained an invalid key!'
		else
			hash = Crypto.createHash("md5")
			key1 = @pack numkey1 / spaces1
			key2 = @pack numkey2 / spaces2

			hash.update key1
			hash.update key2
			hash.update @head.toString("binary")

			res += '\r\n\r\n'
			res += hash.digest 'binary'

	console.log(res)

	if res?
		@write res, 'binary'
		@state = Client.STATUS_READY
		@emit 'ready', @
		
# ## Pack
#
#
Client.prototype.pack = (num) ->
	result = ''
	result += String.fromCharCode(num >> 24 & 0xFF)
	result += String.fromCharCode(num >> 16 & 0xFF)
	result += String.fromCharCode(num >> 8 & 0xFF)
	result += String.fromCharCode(num &	0xFF)

# ## getOrigin
#
# Parse the origin from the request object.
#
Client.prototype.getOrigin = (request) ->
	origin = "*"

	if origin is "*" or Array.isArray(origin)
		origin = request.headers.origin

# ## getLocation
#
# Parse the location from the requiest object.
#
Client.prototype.getLocation = (request) ->
	if request.headers["host"] is undefined
		sys.log "Missing host header"
		return

	location = ""
	secure = request.socket.secure
	host = request.headers.host.split(":")
	port = secure ? 443 : 80
	
	if host[1] isnt undefined
		port = host[1]

	location += secure ? "wss://" : "ws://"
	location += host[0]
	
	if not secure? and port isnt 80 or secure? and port isnt 443
		location += ":" + port
	
	location += request.url
	location = 'ws://localhost:8000/'
	return location

# Client is in unknown state
Client.STATUS_OPENING = 0

# Client is doing initial handshake.
Client.STATUS_HANDSHAKING = 1

# Client is handshaked and ready for data processing.
Client.STATUS_READY = 2

# Client is closing and will be removed in short time. No more data is processed.
Client.STATUS_CLOSING = 3

# Client encountered an error and is no longer able to work correctly.
Client.STATUS_ERROR = 4

# Client connection was rejected by server.
Client.STATUS_REJECTED = 5