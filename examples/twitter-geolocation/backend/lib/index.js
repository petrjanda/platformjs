var PlatformJS, Twitter, TwitterServer, events, keyword, password, server, sys, username;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
username = process.ARGV[2];
password = process.ARGV[3];
keyword = process.ARGV[4];
sys = require('sys');
events = require('events');
Twitter = require('./twitter');
PlatformJS = require('platformjs');
if (!((username != null) && (password != null))) {
  console.log("Usage: node index.js <twitter_username> <twitter_password>");
  process.exit(1);
}
TwitterServer = function() {
  PlatformJS.call(this);
  this.twitter = new Twitter();
  this.twitter.on(Twitter.NEW_TWEET, __bind(function(tweet) {
    console.log('[twitter] New tweet');
    return this.clients.broadcast(JSON.stringify(tweet));
  }, this));
  this.twitter.login(username, password);
  return this.twitter.track();
};
sys.inherits(TwitterServer, PlatformJS);
server = new TwitterServer();
server.listen();