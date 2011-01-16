/*!
 * Platform.js
 * Copyright(c) 2010 Petr Janda
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var url = require('url'),	
	net = require('net'),	
	sys = require('sys'),	
	http = require('http'),
	utils = require('connect'),
	
	Storage = require('./storage'),
	Client = require('client'), 
	Clients = require('./clients'),	
	Channels = require('./channels');
//	Exceptional = require('./exceptional').Exceptional;

// All exception raised in the application, which are not caught by try blocks
// are being catched here. All of the are supposed to be delivered into external
// exception handling provider to monitor system. Exception is put to the log as well.
/*process.on('uncaughtException', function (err) {
	Exceptional.handle(err);
	console.log('Caught uncaughtException: ' + err.stack);
});

// Exceptional API key
Exceptional.API_KEY = "7cb44fc82cbf296ad3bd95a253cad370b06911e0";*/

/*
 * PlatformJS is HTTP server module for real-time communication using 
 * the WebSocket protocol. Its properly designed to be able to cooperate
 * on top of the regular HTTP server instance based on express, connect 
 * or any other solution.
 *
 */
var Server = module.exports = function() {

	var self = this;

	// module for managing connected clients
	self.clients = new Clients();
	
	// channel list
	self.channels = new Channels();
	
	// storage system
	self.storage = new Storage();
	
	self.server = null;
}

Server.prototype.listen = function(server) {
	
	var self = this;
	
	self.server = server;
	
	self.storage.on('data', function(change) {
		
		request({uri: self.storage.databaseURL + '/' + change.id}, function(error, response, body) {
		
			if(response.statusCode == '200') {			
				var data = JSON.parse(body)
				  , channel = null;
				
				if(data.type == 'message') {
					channel = self.channels.get(data.channel);
					
					if(channel)
						channel.broadcast(data.message);
				}
			} 
		});
	});
	
	// Start the storage observer on database changes feed
	self.storage.startObserver();

	// When server emit new upgrade event, new ws:// client has connected. Client
	// request URL is parsed to get information which channel he want to connect to.
	server.addListener('upgrade', function(request, socket, head) {
		
		var channelTitle = url.parse(request.url).pathname
		  , channel = null
		  , client = null;
		
		// Control if requested channel is already on the server
		if(!self.channels.has(channelTitle)) {
			
			// If channel doesn't exist, we just create one on the fly
			channel = self.channels.create(channelTitle);

			// As soon as the channel is created, server instance will start to wait
			// for any incoming data to the socket. This data are immediately sent
			// to server database instance, so they are widespread accross all cluster
			// and running node instances, so all clients connected to same channels
			// and different node instances will receive data as well.
			channel.on('data', function(data, channel, client) {
				self.storage.sendMessage(data, channel, client);
			});
		}
		else {
			channel = self.channels.get(channelTitle);
		}
		
		// Create new client instance, generate the unique session ID and bypass all
		// request data so client can be handshaked and then connected to the server. 	
		client = new Client(utils.uid(), request, socket, head);
		
		// Store client to clients manager
		self.clients.connect(client);
		
		// Connect client to requested channel
		channel.connect(client);
	});	
}

Server.prototype.close = function() {
	var self = this;
	
	self.channels.destroyAll();
	//self.clients.disconnectAll();
	self.server.removeAllListeners('upgrade');
}

Server.databaseURL = "http://localhost:5984/platformjs";
