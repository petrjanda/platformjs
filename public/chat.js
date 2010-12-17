var Chat = function() {
	
	var self = this;
	
	self.buffer = [];
	
	self.ws = null;
}

Chat.prototype.write = function(content) {
	
	var self = this;
	
	$("#output").prepend("<div class='message'>" +
						"<span class='time'>" + 
							new Date().getHours() + ":" + 
							new Date().getMinutes() + ":" + 
							new Date().getSeconds() + 
						"</span>" + 
						content + 
						"</div>");
}

Chat.prototype.connect = function() {
	
	var self = this;
	
	var server = $('#lblServer').val();
	
	self.write("Connecting server ws://" + server);
	
	if ("WebSocket" in window) {
	  	self.ws = new WebSocket("ws://" + server);

		self.ws.onopen = function() {
			self.write("Socket opened");
			
			while(self.buffer.length)
				self.send(self.buffer.shift());
		};

	  	self.ws.onmessage = function (evt) { 
			self.write(event.data);
		};

	  	self.ws.onclose = function() {
			self.write("Socket closed");
		};
	} 
	else {
		self.write("Browser doesn't support WebSockets!");
	}
}

Chat.prototype.init = function() {
	
	var self = this;
	
	$("#btnSubmit").click(function() {
		self.send();			
	});
	
	$('#lblInput').keydown(function(event) {
		if(event.keyCode == 13)
			self.send();
	});
	
	$('#input').hide();

	$('#btnConnect').click(function() {
		
		self.connect();
		
		$('#connect').hide();
		$('#input').show();
		$('#lblInput').focus();	
	});
};

Chat.prototype.send = function() {
	
	var self = this,
		message = $('#lblInput').val();

	if(self.ws.readyState == WebSocket.CLOSED)
	{
		self.buffer.push(message)
		self.connect();
		return;
	}
		
	self.ws.send(message);
	$('#lblInput').val('');
	$('#lblInput').focus();
}