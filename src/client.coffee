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
# http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-75
# http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-76
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
			
	return
	
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
		
Client.prototype.close = () ->
	if @state is Client.STATUS_READY
		@write '\xff\x00', 'binary'
	
# The WebSocket client's handshake appears to HTTP servers to be a regular GET 
# request with an Upgrade offer:
#
# 	GET / HTTP/1.1
# 	Upgrade: WebSocket
# 	Connection: Upgrade
#
# Fields in the handshake are sent by the client in a random order; the 
# order is not meaningful.
#
# Additional fields are used to select options in the WebSocket protocol.
# The only options available in this version are the subprotocol selector, 
# |Sec-WebSocket-Protocol|, and |Cookie|, which can used for sending cookies 
# to the server (e.g. as an authentication mechanism).  The |Sec-WebSocket-Protocol| 
# field takes an arbitrary string:
#
# 	Sec-WebSocket-Protocol: chat
#
# This field indicates the subprotocol (the application-level protocol layered over 
# the WebSocket protocol) that the client intends to use. The server echoes this 
# field in its handshake to indicate that it supports that subprotocol.
#
Client.prototype.handshake = () ->
	res = null
	location = @getLocation @request

	if location
		res = 'HTTP/1.1 101 WebSocket Protocol Handshake\r\nUpgrade: WebSocket\r\nConnection: Upgrade\r\nSec-WebSocket-Origin: ' + @getOrigin() + '\r\nSec-WebSocket-Location: ' + location

		# For each of these fields, the server has to take the digits from the
		# value to obtain a number (in this case 1868545188 and 1733470270
		# respectively), then divide that number by the number of spaces
		# characters in the value (in this case 12 and 10) to obtain a 32-bit
		# number (155712099 and 173347027).  These two resulting numbers are
		# then used in the server handshake.
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
			
			# The concatenation of the number obtained from processing the |Sec-
			# WebSocket-Key1| field, expressed as a big-endian 32 bit number, the
			# number obtained from processing the |Sec-WebSocket-Key2| field, again
			# expressed as a big-endian 32 bit number, and finally the eight bytes
			# at the end of the handshake, form a 128 bit string whose MD5 sum is
			# then used by the server to prove that it read the handshake.
			hash.update key1
			hash.update key2
			hash.update @head.toString("binary")

			res += '\r\n\r\n'
			res += hash.digest 'binary'

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

Client.prototype.getVersion = () ->
	"76"

# ## getOrigin
#
# Parse the origin from the request object.
#
Client.prototype.getOrigin = () ->
	origin = @request.headers.origin

# ## getLocation
#
# Parse the location from the requiest object.
#
Client.prototype.getLocation = (request) ->
	unless request.headers.host?
		sys.log "Missing host header"
		return

	location = ""
	secure = request.socket.secure
	host = request.headers.host.split(":")
	
	if secure
		port = 443
		protocol = "wss://"
	else
		port = 80
		protocol = "ws://"
	
	if host[1]?
		port = host[1]

	location += protocol
	location += host[0]
	
	if not secure? and port isnt 80 or secure? and port isnt 443
		location += ":" + port
	
	if request.url?
		location += request.url
		
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