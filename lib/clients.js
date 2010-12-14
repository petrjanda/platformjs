/*!
 * Platform.js
 * Copyright(c) 2010 Petr Janda
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var url = require('url'),
	sys = require('sys');

/*
 * Manager class responsible to hold information about all clients connected
 * to the server.
 *
 */
var Clients = module.exports = function() {
	
	var self = this;
	
	self.clients = {};
}

/*
 * Add new client to server client list.
 */
Clients.prototype.connect = function(client) {
	
	var self = this;
		
	if(client.request.method == "GET" && ('upgrade' in client.request.headers && 'connection' in client.request.headers) &&
	   client.request.headers.upgrade.toLowerCase() == 'websocket' && client.request.headers.connection.toLowerCase() == 'upgrade') {
		self.clients[client.sid] = client;
		client.handshake();
		sys.log("Client " + client.sid + " connected.");
	}
	else {
		client.close();
	}	
};

/*
 * Remove client from server client list.
 */
Clients.prototype.disconnect = function(client) {
	
	var self = this;
	
	sys.log("Client " + client.sid + " disconnected.");
			
	client.close();
	
	self.clients[client.sid] = null;
};