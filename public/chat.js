var Chat = function() {
	
	var self = this;
	
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

Chat.prototype.init = function() {
	
	var self = this;
	
	$("#btnSubmit").click(function() {
		self.ws.send($('#lblInput').val());
		$('#lblInput').val('');
		$('#lblInput').focus();				
	});
	
	$('#lblInput').keydown(function(event) {
		if(event.keyCode == 13) {
			self.ws.send($('#lblInput').val());
			$('#lblInput').val('');
			$('#lblInput').focus();
		}	
	});
	
	$('#input').hide();

	$('#btnConnect').click(function() {
		
		self.write("Connecting server ws://" + $('#lblServer').val());
		
		if ("WebSocket" in window) {
		  	self.ws = new WebSocket("ws://" + $('#lblServer').val());

			self.ws.onopen = function() {
				self.write("Socket opened");
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
		
		$('#connect').hide();
		$('#input').show();
		$('#lblInput').focus();	
	});
};