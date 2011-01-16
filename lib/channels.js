/*!
 * Platform.js
 * Copyright(c) 2010 Petr Janda
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var sys = require('sys')
  , Channel = require('./channel')
  , Events = require("events");

var Channels = module.exports = function() {
	
	process.EventEmitter.call(this);
	
	var self = this;
	
	self.list = {};
	self.count = 0;
};

sys.inherits(Channels, Events.EventEmitter);

/*
 * Create new channel to allow users to communicate.
 *
 */
Channels.prototype.create = function(title) {
	
	var self = this,
		channel = null;
	
	if(self.list[title])
		throw new Error('Channel ' + title + ' already exists!');

	self.list[title] = channel = new Channel(title);
	self.count++;
	
	return channel;
};

/*
 * Remove one channel from the server.
 * 
 * @param title	Title of the channel to remove.
 */
Channels.prototype.destroy = function(title) {
	
	var self = this;
	
	self.list[title].destroy();
	delete self.list[title];
	self.count--;
}

/*
 * Remove all channels from the server. This mean all the channels are
 * destroyed to have clean channels list.
 *
 */
Channels.prototype.destroyAll = function() {
	
	var self = this;
	
	for(var title in self.list) {
//		self.list[title].destroy();
		delete self.list[title];
		self.count--;
	}
}

Channels.prototype.get = function(title) {
	
	var self = this;
	
	return self.list[title];
}

/*
 * Check if the channel with specified name already exists.
 *
 * @param title	Title of the channel to check for presence.
 */ 
Channels.prototype.has = function(title) {
	
	var self = this;
	
	return !!self.list[title];
}