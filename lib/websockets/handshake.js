var sys = require('sys')
,	Crypto = require('crypto');

exports.handshake = function(version, request, head) {
	
	sys.log("Client: Doing handshake version " + version);
	
	var location = require('./helpers').getLocation(request);
	var res;
	
	if(location) {
		
		res = "HTTP/1.1 101 WebSocket Protocol Handshake\r\n"
		    + "Upgrade: WebSocket\r\n"
		    + "Connection: Upgrade\r\n"
		    + "Sec-WebSocket-Origin: "+ require('./helpers').getOrigin(request) + "\r\n"
		    + "Sec-WebSocket-Location: "+ location;

//			if(this._server.options.subprotocol && typeof this._server.options.subprotocol == "string") {				
//			  	res += "\r\nSec-WebSocket-Protocol: "+this._server.options.subprotocol;
//			}

		var strkey1 = request.headers['sec-websocket-key1']
		  , strkey2 = request.headers['sec-websocket-key2']

		  , numkey1 = parseInt(strkey1.replace(/[^\d]/g, ""), 10)
		  , numkey2 = parseInt(strkey2.replace(/[^\d]/g, ""), 10)

		  , spaces1 = strkey1.replace(/[^\ ]/g, "").length
		  , spaces2 = strkey2.replace(/[^\ ]/g, "").length;
	
		if (spaces1 == 0 || spaces2 == 0 || numkey1 % spaces1 != 0 || numkey2 % spaces2 != 0) {
			  
				sys.log("Client: WebSocket contained an invalid key -- closing connection.");
			} 
		else {
				
		  	var hash = Crypto.createHash("md5")
		    , 	key1 = pack(parseInt(numkey1 / spaces1))
		    , 	key2 = pack(parseInt(numkey2 / spaces2));

		  	hash.update(key1);
		  	hash.update(key2);
		  	hash.update(head.toString("binary"));

		  	res += "\r\n\r\n";
		  	res += hash.digest("binary");

		  	return res;
		}			
	}
	
	return null;
}

var pack = function(num) {
	
  	var result = '';
  	result += String.fromCharCode(num >> 24 & 0xFF);
  	result += String.fromCharCode(num >> 16 & 0xFF);
  	result += String.fromCharCode(num >> 8 & 0xFF);
  	result += String.fromCharCode(num &	0xFF);

	return result;
};