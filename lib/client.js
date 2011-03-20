var Buffer, Client, Crypto, Events, sys, url;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
sys = require('sys');
Events = require('events');
url = require('url');
Crypto = require('crypto');
Buffer = require('buffer').Buffer;
Client = module.exports = function(sid, request, socket, head) {
  process.EventEmitter.call(this);
  this.request = request;
  this.socket = socket;
  this.sid = sid;
  this.head = head;
  this.state = Client.STATUS_OPENING;
  this.socket.on('data', this.dataHandler(data));
  if (this.getVersion() === "76") {
    if (this.head.length >= 8) {
      this.request.upgradeHead = head.slice(0, 8);
      return this.firstFrame = head.slice(8, head.length);
    } else {
      return this.reject("Missing key3");
    }
  }
};
sys.inherits(Client, Events.EventEmitter);
Client.prototype.dataHandler = __bind(function(data) {
  if (data.length === 2 && data[0] === 0xFF && data[1] === 0x00) {
    return this.state = STATUS_CLOSING;
  } else {
    return this.emit('data', this, data.substring(1, data.length - 1));
  }
}, this);
Client.prototype.getVersion = function() {
  return "75";
};
Client.prototype.send = function(data) {
  if (this.state === Client.STATUS_READY) {
    try {
      this.write("\x00", "binary");
      this.write(data, "utf8");
      return this.write("\xff", "binary");
    } catch (e) {
      return sys.log(e);
    }
  }
};
Client.prototype.write = function(data, encoding) {
  if (!this.socket.writable) {
    throw new Error("Client socket not writable!");
  }
  try {
    return this.socket.write(data, encoding);
  } catch (e) {
    throw new Error('Client error writing to socket' + e);
  }
};
Client.prototype.handshake = function(version, request, head) {
  var hash, key1, key2, location, numkey1, numkey2, res, spaces1, spaces2, strkey1, strkey2;
  location = this.getLocation(request);
  if (location) {
    res = "HTTP/1.1 101 WebSocket Protocol Handshake\r\n";
    +"Upgrade: WebSocket\r\n";
    +"Connection: Upgrade\r\n";
    +"Sec-WebSocket-Origin: " + this.getOrigin(request) + "\r\n";
    +"Sec-WebSocket-Location: " + location;
    strkey1 = request.headers['sec-websocket-key1'];
    strkey2 = request.headers['sec-websocket-key2'];
    numkey1 = parseInt(strkey1.replace(/[^\d]/g, ""), 10);
    numkey2 = parseInt(strkey2.replace(/[^\d]/g, ""), 10);
    spaces1 = strkey1.replace(/[^\ ]/g, "").length;
    spaces2 = strkey2.replace(/[^\ ]/g, "").length;
    if (spaces1 === 0 || spaces2 === 0 || numkey1 % spaces1 !== 0 || numkey2 % spaces2 !== 0) {
      sys.log("Client: WebSocket contained an invalid key -- closing connection.");
    } else {
      hash = Crypto.createHash("md5");
      key1 = pack(numkey1 / spaces1);
      key2 = pack(numkey2 / spaces2);
      hash.update(key1);
      hash.update(key2);
      hash.update(head.toString("binary"));
      res += "\r\n\r\n";
      res += hash.digest("binary");
      return res;
    }
  }
  return null;
};
Client.prototype.pack = function(num) {
  var result;
  result = '';
  result += String.fromCharCode(num >> 24 & 0xFF);
  result += String.fromCharCode(num >> 16 & 0xFF);
  result += String.fromCharCode(num >> 8 & 0xFF);
  return result += String.fromCharCode(num & 0xFF);
};
Client.prototype.getOrigin = function(request) {
  var origin;
  origin = "*";
  if (origin === "*" || Array.isArray(origin)) {
    return origin = request.headers.origin;
  }
};
Client.prototype.getLocation = function(request) {
  var host, location, port, secure;
  if (request.headers["host"] === void 0) {
    sys.log("Missing host header");
    return;
  }
  location = "";
  secure = request.socket.secure;
  host = request.headers.host.split(":");
  port = secure != null ? secure : {
    443: 80
  };
  if (host[1] !== void 0) {
    port = host[1];
  }
  location += secure != null ? secure : {
    "wss://": "ws://"
  };
  location += host[0];
  if (!(secure != null) && port !== 80 || (secure != null) && port !== 443) {
    location += ":" + port;
  }
  location += request.url;
  return location;
};
Client.STATUS_OPENING = 0;
Client.STATUS_HANDSHAKING = 1;
Client.STATUS_READY = 2;
Client.STATUS_CLOSING = 3;
Client.STATUS_ERROR = 4;
Client.STATUS_REJECTED = 5;