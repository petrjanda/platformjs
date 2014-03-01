var Channel, Events, sys;
util = require('util');
Events = require('events');
Channel = module.exports = function(title) {
  this.title = title;
  return this.clientsCount = 0;
};
util.inherits(Channel, Events.EventEmitter);
Channel.prototype.connect = function(client) {
  if (!this.clients) {
    this.clients = {};
  }
  this.clients[client.sid] = client;
  return this.clientsCount++;
};
Channel.prototype.disconnect = function(client) {
  this.clients[client.sid] = null;
  return this.clientsCount--;
};
Channel.prototype.send = function(clientID, data) {
  var client;
  try {
    client = this.clients[clientID];
  } catch (error) {
    throw new Error("The client is invalid!");
  }
  return client.send(data);
};
Channel.prototype.broadcast = function(data) {
  var sid, _results;
  _results = [];
  for (sid in this.clients) {
    _results.push(this.clients[sid].send(data));
  }
  return _results;
};