exports.getOrigin = function(request) {
	
	var origin = "*";
	
	if(origin == "*" || Array.isArray(origin)) {
		
		origin = request.headers.origin;
	}
	  
	return origin;
}

exports.getLocation = function(request) {
	
 	if(request.headers["host"] === undefined) {
    
		sys.log("Missing host header");
		return;
  	}
  
  	var location = ""
    , 	secure = request.socket.secure
    , 	host = request.headers.host.split(":")
    , 	port = host[1] !== undefined ? host[1] : (secure ? 443 : 80);

  	location += secure ? "wss://" : "ws://";
  	location += host[0];

  	if(!secure && port != 80 || secure && port != 443) {

		location += ":" + port;
  	}

  	location += request.url;

  	return location;
};