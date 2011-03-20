#
# Platform.js
# Copyright(c) 2010 Petr Janda
# MIT Licensed
#

sys 	= require 'sys'
Events 	= require 'events'

#
# Channel instance to represent one data channel on the server. Each client is connected
# to at least one or multiple channels with possibility to send message to any of them.
# Message is widespread in channel to all its connected clients. No targeted messages are allowed.
#
# The best way to establish 1:1 communication is to create private channel with only 2 clients
# connected to it.
#
Channel = module.exports = (title) ->
	@title = title
	@clientsCount = 0
	
sys.inherits(Channel, Events.EventEmitter)

#
# Connect client to the channel. After he is successfully added to the channel we start
# listening for any data he send to the channel in order to broadcast them to all other clients
# connected.
#
# @param  client  Client instance to be connected.
#
Channel.prototype.connect = (client) ->
	@clients = {} unless @clients
	@clients[client.sid] = client
	@clientsCount++
	
#
# Disconnect client from the channel.
#
# @param  client  Client instance to be disconnected.
#
Channel.prototype.disconnect = (client) ->
	@clients[client.sid] = null
	@clientsCount--
	
#
# Send the data to one specific client connected to the channel.
#
# @param	clientID	Unique identifier of client on the server.
# @param	data		Data to be sent.
#
Channel.prototype.send = (clientID, data) ->
	try
		client = @clients[clientID]
	catch error
		throw new Error("The client is invalid!")
		
	client.send(data);
		
#
# Broadcast data to all clients connected to the server.
#
# @param	data	Data to be send to the client.
#
Channel.prototype.broadcast = (data) ->
	@clients[sid].send(data) for sid of @clients