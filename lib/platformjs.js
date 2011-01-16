exports.version = "0.2.0";

var Server = require("./server");

exports.createServer = function(){
  return new Server();
};