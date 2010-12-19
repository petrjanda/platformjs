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
	http = require('http'),
	fs = require('fs'),
	path = require('path'),
	sys = require('sys'),
	querystring = require('querystring');
	mixin = require('./mixin'),
	request = require('./request'),
	
	Buffer = require("buffer").Buffer,	
	Crypto = require('crypto');

	
// Encode only key, startkey and endkey as JSON
exports.toQuery = function(query) {
	
	for (var k in query) {
		if (['key', 'startkey', 'endkey'].indexOf(k) != -1) {
			query[k] = JSON.stringify(query[k]);
		} else {
			query[k] = String(query[k]);
		}
	}
		
	return querystring.stringify(query);
};
	
var Storage = module.exports = function() {

	process.EventEmitter.call(this);
	
	var self = this;
	 
	self.databaseURL = 'http://' + Storage.host + ':' + Storage.port + '/' + Storage.database;
}

sys.inherits(Storage, Events.EventEmitter);	

Storage.prototype.sendMessage = function(data, channel, client) {
	
	var self = this
	
	  , doc = 
		{
			'type': 'message',
			'client': client.sid,
			'channel': channel.title,
			'message': data
		};
		
 	var params = 
		{
			uri:self.databaseURL, 
			method:'POST',
			headers: Storage.header,
			body: JSON.stringify(doc)
		};
	
	
	request(params, function (error, response) {
		if(error)
			throw new Error(error);
	});
}

Storage.prototype.startObserver = function(query, options) {

	var self = this;

	query = mixin({
    	feed: "continuous",
		heartbeat: 1 * 1000
		}, query || {});
		
  	var	client = null,
    	path = '/' + Storage.database + '/_changes?' + exports.toQuery(query),
    	request = null,
    	buffer = '';

	client = http.createClient(Storage.port, Storage.host, false);
  	client.setTimeout(0);

	request = client.request('GET', path);

	request.addListener("response", function(res) {
		
    	res.addListener('data', function(chunk) {
			
			buffer += (chunk || '');

      		var offset, change;

			while ((offset = buffer.indexOf("\n")) >= 0) {
        		
				change = buffer.substr(0, offset);
				buffer = buffer.substr(offset +1);

				// Couch sends an empty line as the "heartbeat"
        		if (change == '') {
					return self.emit('heartbeat');
				}

				try {
					change = JSON.parse(change);
				} catch (e) {
					return self.emit('error', change);
				}

				self.emit('data', change);
      		}
    	})
  	});

	request.end();

	client.addListener('close', function(hadError) {
    	self.emit('end', hadError);
  	});
};

Storage.header = {'content-type': 'application/json', 'accept': 'application/json'};
Storage.database = "platformjs";
Storage.host = "localhost";
Storage.port = "5984"; 