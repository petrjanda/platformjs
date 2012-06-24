var Buffer, Client, Crypto, Events, Log, sys, url;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
util = require('util');
Events = require('events');
url = require('url');
Crypto = require('crypto');
Buffer = require('buffer').Buffer;
Log = require('./log');
Client = module.exports = function(sid, request, socket, head) {
  process.EventEmitter.call(this);
  this.request = request;
  this.socket = socket;
  this.head = head;
  this.sid = sid;
  this.state = Client.STATUS_OPENING;
  this.socket.setTimeout(0);
  this.socket.setEncoding('utf8');
  this.socket.setKeepAlive(true);
  this.socket.on('data', __bind(function(data) {
    if (data.length === 2 && data[0] === 0xFF && data[1] === 0x00) {
      return this.state = STATUS_CLOSING;
    } else {
      return this.emit('data', this, data.substring(1, data.length - 1));
    }
  }, this));
  if (this.getVersion() === "76") {
    if (this.head.length >= 8) {
      this.request.upgradeHead = head.slice(0, 8);
      this.firstFrame = head.slice(8, head.length);
    } else {
      this.close();
    }
  }
};
util.inherits(Client, Events.EventEmitter);
Client.prototype.send = function(data) {
  if (this.state === Client.STATUS_READY) {
    try {
      this.write('\x00', 'binary');
      this.write(data, 'utf8');
      return this.write('\xff', 'binary');
    } catch (e) {
      return Log.error('client', e);
    }
  }
};
Client.prototype.write = function(data, encoding) {
  if (!this.socket.writable) {
    throw new Error('Client socket not writable!');
  }
  try {
    return this.socket.write(data, encoding);
  } catch (e) {
    throw new Error('Client error writing to socket' + e);
  }
};
Client.prototype.close = function() {
  if (this.state === Client.STATUS_READY) {
    return this.write('\xff\x00', 'binary');
  }
};
Client.prototype.handshake = function() {
  var hash, key1, key2, location, numkey1, numkey2, res, spaces1, spaces2, strkey1, strkey2;
  res = null;
  location = this.getLocation(this.request);

  if (location) {
    res = 'HTTP/1.1 101 WebSocket Protocol Handshake\r\nUpgrade: WebSocket\r\nConnection: Upgrade\r\nSec-WebSocket-Origin: ' + this.getOrigin() + '\r\nSec-WebSocket-Location: ' + location;
    strkey1 = this.request.headers['sec-websocket-key1'];
    strkey2 = this.request.headers['sec-websocket-key2'];
    numkey1 = parseInt(strkey1.replace(/[^\d]/g, ""), 10);
    numkey2 = parseInt(strkey2.replace(/[^\d]/g, ""), 10);
    spaces1 = strkey1.replace(/[^\ ]/g, "").length;
    spaces2 = strkey2.replace(/[^\ ]/g, "").length;
    if (spaces1 === 0 || spaces2 === 0 || numkey1 % spaces1 !== 0 || numkey2 % spaces2 !== 0) {
      Log.error('client', 'WebSocket contained an invalid key!');
    } else {
      hash = Crypto.createHash("md5");
      key1 = this.pack(numkey1 / spaces1);
      key2 = this.pack(numkey2 / spaces2);
      hash.update(key1);
      hash.update(key2);
      hash.update(this.head.toString("binary"));
      res += '\r\n\r\n';
      res += hash.digest('binary');
    }
  }
  if (res != null) {
    this.write(res, 'binary');
    this.state = Client.STATUS_READY;
    return this.emit('ready', this);
  }
};
Client.prototype.pack = function(num) {
  var result;
  result = '';
  result += String.fromCharCode(num >> 24 & 0xFF);
  result += String.fromCharCode(num >> 16 & 0xFF);
  result += String.fromCharCode(num >> 8 & 0xFF);
  return result += String.fromCharCode(num & 0xFF);
};
Client.prototype.getVersion = function() {
  return "76";
};
Client.prototype.getOrigin = function() {
  var origin;
  return origin = this.request.headers.origin;
};
Client.prototype.getLocation = function(request) {
  var host, location, port, protocol, secure;
  if (request.headers.host == null) {
    Log.error('client', 'Missing host header');
    return;
  }
  location = "";
  secure = request.socket.secure;
  host = request.headers.host.split(":");
  if (secure) {
    port = 443;
    protocol = "wss://";
  } else {
    port = 80;
    protocol = "ws://";
  }
  if (host[1] != null) {
    port = host[1];
  }
  location += protocol;
  location += host[0];
  if (!(secure != null) && port !== 80 || (secure != null) && port !== 443) {
    location += ":" + port;
  }
  if (request.url != null) {
    location += request.url;
  }
  return location;
};
Client.STATUS_OPENING = 0;
Client.STATUS_HANDSHAKING = 1;
Client.STATUS_READY = 2;
Client.STATUS_CLOSING = 3;
Client.STATUS_ERROR = 4;
Client.STATUS_REJECTED = 5;