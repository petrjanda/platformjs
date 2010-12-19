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
	
	return channel;
};

/*
 * Destroy the channel and clear it completely from
 * the server.
 *
 */
Channels.prototype.destroy = function(title) {
	
	var self = this;
	
	self.list[title].destroy();
	self.list[title] = null;
}

Channels.prototype.get = function(title) {
	
	var self = this;
	
	return self.list[title];
}

Channels.prototype.has = function(title) {
	
	var self = this;
	
	return !!self.list[title];
}