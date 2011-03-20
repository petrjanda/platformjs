#
# Platform.js
# Copyright(c) 2010 Petr Janda
# MIT Licensed
#

#
# Module dependencies.
#
url 		= require 'url' 
net 		= require 'net' 	
sys 		= require 'sys' 	
http 		= require 'http' 
connect 	= require 'connect' 
utils 		= connect.utils
	
Storage 	= require './storage' 
Client 		= require 'client'
Clients 	= require './clients'
Channels 	= require './channels'

# Exceptional = require('./exceptional').Exceptional;

# All exception raised in the application, which are not caught by try blocks
# are being catched here. All of the are supposed to be delivered into external
# exception handling provider to monitor system. Exception is put to the log as well.
process.on 'uncaughtException', (err) ->
	console.log 'Caught uncaughtException: ' + err.stack

#
# PlatformJS is HTTP server module for real-time communication using 
# the WebSocket protocol. Its properly designed to be able to cooperate
# on top of the regular HTTP server instance based on express, connect 
# or any other solution.
#
#
Server = module.exports = () ->
	# Module for managing connected clients
	@clients = new Clients()
	@channels = new Channels()
	@server = null

Server.prototype.listen = (server) ->
	@server = server

	# When server emit new upgrade event, new ws:// client has connected. Client
	# request URL is parsed to get information which channel he want to connect to.
	server.on 'upgrade', (request, socket, head) ->
		channelTitle = url.parse(request.url).pathname
		channel = null
		client = null
		
		# Control if requested channel is already on the server
		unless @channels.has channelTitle
			
			# If channel doesn't exist, we just create one on the fly
			channel = self.channels.create(channelTitle);
			# As soon as the channel is created, server instance will start to wait
			# for any incoming data to the socket. This data are immediately sent
			# to server database instance, so they are widespread accross all cluster
			# and running node instances, so all clients connected to same channels
			# and different node instances will receive data as well.
			# channel.on('data', (data, channel, client) ->
			#	@storage.sendMessage(data, channel, client);
		else
			channel = @channels.get(channelTitle)
	
	# Create new client instance, generate the unique session ID and bypass all
	# request data so client can be handshaked and then connected to the server. 	
	client = new Client(utils.uid(), request, socket, head);
	
	# Store client to clients manager
	self.clients.connect(client);
	
	# Connect client to requested channel
	channel.connect(client);


Server.prototype.close = () ->
	@channels.destroyAll()
	@server.removeAllListeners 'upgrade'
