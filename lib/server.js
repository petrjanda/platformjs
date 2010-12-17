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
	
	Client = require('client'), 
	Clients = require('./clients'),	
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

	// start server
	server.addListener('upgrade', function(request, socket, head) {
		self.clients.connect(new Client(utils.uid(), request, socket, head));
	});
	
	// write bootstrap message
	sys.puts("=> Booting Platform.js");
	sys.puts("=> Version " + PlatformJS.version + " running");
}

/**
 * Server version.
 */
PlatformJS.version = '0.1.0';