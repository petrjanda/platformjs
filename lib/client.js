/*!
 * Platform.js
 * Copyright(c) 2010 Petr Janda
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var sys = require('sys'), 
	Events = require("events"), 
	url = require('url'),
	handshake = require('./websockets/handshake').handshake,
	
	Buffer = require("buffer").Buffer,	
	Crypto = require('crypto');
	
	

/* 
 * Instance of client connected to server.
 */
var Client = function(sid, request, socket, head) {
	
	process.EventEmitter.call(this);
	
	var self = this;
	
	self.request = request;
	self.socket = socket;
	self.sid = sid;
	self.head = head;
	
	self.channel = null;
	
	// Initial connection state.
	self.state = Client.STATUS_OPENING;

	self.socket.setEncoding('utf8');
	self.socket.setTimeout(0);
	self.socket.setNoDelay(true);
	self.socket.setKeepAlive(true, 0);
		
	var order = 0;
	var framedata = [];
	var firstFrame = false;
	
	socket.addListener('data', function(data) {
		self.dataHandler(data);
	});
//	socket.addListener('end', self.endHandler);
//	socket.addListener('timeout', self.timeoutHandler);
//	socket.addListener('error', self.errorHandler);
	
    if(self.getVersion() == "76") {
		if(head.length >= 8) {
        	self.request.upgradeHead = head.slice(0, 8);
        	self.firstFrame = head.slice(8, head.length);
      	} else
 			self.reject("Missing key3");
    }
};
	
sys.inherits(Client, Events.EventEmitter);	

/*
 * Client is in unknown state
 */	
Client.STATUS_OPENING = 0;

/*
 * Client is doing initial handshake.
 */
Client.STATUS_HANDSHAKING = 1;

/*
 * Client is handshaked and ready for data processing.
 */
Client.STATUS_READY = 2;

/*
 * Client is closing and will be removed in short time. No more data
 * is processed.
 */
Client.STATUS_CLOSING = 3;

/* 
 * Client encountered an error and is no longer able to work
 * correctly.
 */
Client.STATUS_ERROR = 4;

/*
 * Client connection was rejected by server.
 */
Client.STATUS_REJECTED = 5;	
	
Client.prototype.send = function(data) {
	
	var self = this;
	
	if(self.state == Client.STATUS_READY) {
		
		if(self.request.socket.writable) {
		
			if( self.write("\x00", "binary") &&
			    self.write(data, "utf8") &&
			    self.write("\xff", "binary")) {
				
				return true;
			}
			else {
			
				sys.log("Client: Couldn't sent data.");
			}
		}
	}
	else {
		
		sys.log("Client: Couldn't sent data.");
	}
}

/* 
 * Method to close the client. 
 * Ensures that no more I/O activity happens on this stream.
 */
Client.prototype.close = function() {
	
	var self = this;
	
	if(self.state == Client.STATUS_READY && self.socket.writable) {
	    self.send('');
	}
	  
	self.socket.flush();
	self.socket.end();
};

Client.prototype.dataHandler =  function(data) {

	var self = this;
	
	if(data.length == 2 && data[0] == 0xFF && data[1] == 0x00)
		state = STATUS_CLOSING;
	else
		self.emit("data", self, data.substring(1, data.length - 1));
};	
	
Client.prototype.handshake = function() {
	
	var self = this,
		response = null;
	
  	if(self.state < Client.STATUS_HANDSHAKING) {
    	self.state = Client.STATUS_HANDSHAKING;

		if(response = handshake(self.getVersion(), self.request, self.head)) {
			self.write(response, 'binary');
			self.state = Client.STATUS_READY;
			self.emit('ready', self);
		}
  	} 
};
	
Client.prototype.write = function(data, encoding) {
  
	var self = this;
	
	if(self.socket.writable) {
    	try {
 			self.socket.write(data, encoding);
			return true;
    	} 
		catch(e) {
			throw new Error('Client error writing to socket' + e);
		}
  	}

	return false;
};

/*
 * Get version of WebSocket protocol specification.
 */
Client.prototype.getVersion = function() {
	
	var self = this;
	
    return	self.request.headers["sec-websocket-key1"] && 
			self.request.headers["sec-websocket-key2"] ? "76" : "75";
}

Client.prototype.reject = function(reason) {

	var self = this;
	
	self.state = Client.STATUS_REJECTED;
	self.close();
	
	self.emit('rejected', self, reason);
}

module.exports = Client;