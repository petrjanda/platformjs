var Twitter, base64, events, http, sys;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
sys = require('sys');
http = require('http');
events = require('events');
base64 = require('./base64');
Twitter = module.exports = function() {
  this.port = 80;
  this.host = 'stream.twitter.com';
  return this.buffer = '';
};
sys.inherits(Twitter, events.EventEmitter);
Twitter.prototype.login = function(username, password) {
  this.username = username;
  return this.password = password;
};
Twitter.prototype.track = function() {
  var auth, body, bottomRight, center, options, range, req, topLeft;
  center = [-0.1275, 51.507222];
  range = .5;
  topLeft = [center[0] - range, center[1] - range];
  bottomRight = [center[0] + range, center[1] + range];
  body = 'locations=' + topLeft[0] + ',' + topLeft[1] + ',' + bottomRight[0] + ',' + bottomRight[1];
  auth = base64.encode(this.username + ':' + this.password);
  options = {
    host: 'stream.twitter.com',
    port: 80,
    path: '/1/statuses/filter.json',
    method: 'POST',
    headers: {
      'Authorization': "Basic " + auth,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': body.length
    }
  };
  req = http.request(options, __bind(function(res) {
    console.log(res.statusCode + ' ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    return res.on('data', __bind(function(chunk) {
      var index, json, _results;
      this.buffer += chunk;
      _results = [];
      while ((index = this.buffer.indexOf('\r\n')) > -1) {
        json = this.buffer.slice(0, index);
        this.buffer = this.buffer.slice(index + 2);
        _results.push((function() {
          if (json.length > 0) {
            try {
              json = JSON.parse(json);
              return this.emit(Twitter.NEW_TWEET, json);
            } catch (e) {
              return console.log(e);
            }
          }
        }).call(this));
      }
      return _results;
    }, this));
  }, this));
  req.write(body);
  return req.end();
};
Twitter.NEW_TWEET = 'newTweet';