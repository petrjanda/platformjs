var Client, Clients, Events, Log, sys, url;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
url = require('url');
sys = require('sys');
Events = require('events');
Client = require('./client');
Log = require('./log');
Clients = module.exports = function() {
  process.EventEmitter.call(this);
  return this.count = 0;
};
sys.inherits(Clients, Events.EventEmitter);
Clients.prototype.connect = function(client) {
  if (client.request.method === "GET" && client.request.headers.upgrade.toLowerCase() === 'websocket' && client.request.headers.connection.toLowerCase() === 'upgrade') {
    if (this.list == null) {
      this.list = {};
    }
    if (this.list[client.sid] != null) {
      return;
    }
    this.list[client.sid] = client;
    this.count++;
    client.addListener('data', __bind(function(client, data) {
      return this.emit('data', client, data);
    }, this));
    client.addListener('ready', __bind(function(client) {
      Log.info('clients', 'new connection');
      return this.emit('ready', client);
    }, this));
    return client.handshake();
  } else {
    return client.close();
  }
};
Clients.prototype.disconnect = function(client) {
  client.close();
  delete this.list[client.sid];
  return this.count--;
};
Clients.prototype.disconnectAll = function() {
  var sid;
  for (sid in this.list) {
        this.list[sid].close();
    delete this.list[sid];;
  }
  return this.count = 0;
};
Clients.prototype.broadcast = function(data) {
  var sid, _results;
  _results = [];
  for (sid in this.list) {
    _results.push((this.list[sid].state === Client.STATUS_READY ? this.list[sid].send(data) : void 0));
  }
  return _results;
};