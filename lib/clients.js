/*!
 * Platform.js
 * Copyright(c) 2010 Petr Janda
 * MIT Licensed
 */
var url = require('url');

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
	}
	else {
		client.status = Client.STATUS_ERROR;
		client.socket.end();
		client.socket.destroy();
	}	
};

/*
 * Remove client from server client list.
 */
Clients.prototype.disconnect = function(client) {
	
	var self = this;
	
	// no channel will listen for data event
	client.removeAllListeners("data");
	
	self.clients[client.sid] = null;
};