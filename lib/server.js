var Client, Clients, Events, Log, Server, connect, http, net, sys, url, utils;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
url = require('url');
net = require('net');
sys = require('sys');
http = require('http');
connect = require('connect');
utils = connect.utils;
Client = require('./client');
Clients = require('./clients');
Log = require('./log');
Events = require('events');
process.on('uncaughtException', function(err) {
  return console.log('Caught uncaughtException: ' + err.stack);
});
Server = module.exports = function(options) {
  this.config = options || {
    verbose: false
  };
  this.clients = new Clients();
  this.server = null;
  if (this.config.verbose) {
    Log.enabled = true;
  }
};
sys.inherits(Server, Events.EventEmitter);
Server.prototype.listen = function(server) {
  if (server == null) {
    server = http.createServer(function(req, res) {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      return res.end();
    });
    server.listen(8000);
  }
  this.server = server;
  server.on('upgrade', __bind(function(request, socket, head) {
    return this.clients.connect(new Client(utils.uid(), request, socket, head));
  }, this));
  this.clients.on('data', __bind(function(client, data) {
    Log.info('server', 'sid=' + client.sid + ' Message received');
    return this.emit('message', data, client);
  }, this));
  this.clients.on('ready', __bind(function(client) {
    Log.info('server', 'Client #' + client.sid + ' connected');
    return this.emit('connection', client);
  }, this));
  return Log.info('platformjs', 'Started');
};
Server.prototype.close = function() {
  this.server.removeAllListeners('upgrade');
  return Log.info('platformjs', 'Closed');
};