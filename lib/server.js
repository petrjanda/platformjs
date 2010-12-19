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
	utils = require('./connect/utils'),
	
	Storage = require('./storage'),
	Client = require('client'), 
	Clients = require('./clients'),	
	Channels = require('./channels'),
	Exceptional = require('./exceptional').Exceptional;

process.on('uncaughtException', function (err) {
	Exceptional.handle(err);
	console.log('Caught uncaughtException: ' + err.stack);
});

Exceptional.API_KEY = "7cb44fc82cbf296ad3bd95a253cad370b06911e0";

/*
 * PlatformJS is HTTP server module for real-time communication using 
 * the WebSocket protocol. Its properly designed to be able to cooperate
 * on top of the regular HTTP server instance based on express, connect 
 * or any other solution.
 *
 */
var PlatformJS = module.exports = function(server) {

	var self = this;

	// module for managing connected clients
	self.clients = new Clients();
	
	// channel list
	self.channels = new Channels();
	
	// storage system
	self.storage = new Storage();
	
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
	
	self.storage.startObserver();

	// start server
	server.addListener('upgrade', function(request, socket, head) {
		
		var channelTitle = url.parse(request.url).pathname
		  , channel = null
		  , client = null;
		
		if(!self.channels.has(channelTitle)) {
			channel = self.channels.create(channelTitle);

			channel.on('data', function(data, channel, client) {
				self.storage.sendMessage(data, channel, client);
			});
		}
		else {
			channel = self.channels.get(channelTitle);
		}
			
		client = new Client(utils.uid(), request, socket, head);	

		channel.connect(client);
		client.handshake();
	});

	// write bootstrap message
	sys.puts("=> Booting Platform.js");
	sys.puts("=> Version " + PlatformJS.version + " running");
}

/**
 * Server version.
 */
PlatformJS.version = '0.1.0';

PlatformJS.databaseURL = "http://localhost:5984/platformjs";
