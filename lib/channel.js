/*!
 * Platform.js
 * Copyright(c) 2010 Petr Janda
 * MIT Licensed
 */

var sys = require('sys')
  ,	Events = require('events')
  , Client = require('./client');

/*
 * Channel is one data feed on the server. Its shared place for all the clients, 
 * which can send messages through channel to get them to all other clients 
 * connected.
 *
 */
var Channel = module.exports = function(title) {
	
	process.EventEmitter.call(this);
	
	var self = this;
	
	// unique title
	self.title = title;

	// list of subscribed users
	self.clients = {};
}

sys.inherits(Channel, Events.EventEmitter);

/*
 * Connect client to the channel.
 *
 * @param  client  Client instance to be connected.
 */
Channel.prototype.connect = function(client) {
	
	var self = this;
	
	self.clients[client.sid] = client;
	
	// handle if client send message
	client.on('data', function(client, data) {
		self.emit('data', data, self, client);
	});
};

/*
 * Disconnect client from the channel.
 *
 * @param  client  Client instance to be disconnected.
 */
Channel.prototype.disconnect = function(client) {
	
	var self = this;
	
	self.clients[client.sid] = null;
};

/*
 * Send the data to one specific client connected to the channel.
 *
 * @param	clientID	Unique identifier of client on the server.
 * @param	data		Data to be sent.
 */
Channel.prototype.send = function(clientID, data) {
	
	var self = this,
		client = null;
		
	try {	
		client = self.clients[clientID];
	} 
	catch(e) {
		throw new Error('Sending message to invalid client!');
	}
	
	client.send(data);
}

/*
 * Broadcast data to all clients connected to the server.
 *
 * @param	data	Data to be send to the client.
 */
Channel.prototype.broadcast = function(data) {
	
	var self = this;
	
	for(var sid in self.clients)
		if(self.clients[sid].state == Client.STATUS_READY)
			self.clients[sid].send(data);
}