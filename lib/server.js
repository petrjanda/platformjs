var Channels, Client, Clients, Server, Storage, connect, http, net, sys, url, utils;
url = require('url');
net = require('net');
sys = require('sys');
http = require('http');
connect = require('connect');
utils = connect.utils;
Storage = require('./storage');
Client = require('client');
Clients = require('./clients');
Channels = require('./channels');
process.on('uncaughtException', function(err) {
  return console.log('Caught uncaughtException: ' + err.stack);
});
Server = module.exports = function() {
  this.clients = new Clients();
  return this.server = null;
};
Server.prototype.listen = function(server) {
  this.server = server;
  return server.on('upgrade', function(request, socket, head) {
    return self.clients.connect(new Client(utils.uid(), request, socket, head));
  });
};
Server.prototype.close = function() {
  this.channels.destroyAll();
  return this.server.removeAllListeners('upgrade');
};