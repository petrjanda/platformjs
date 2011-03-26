# PlatformJS

## Installation

In order to install you will need the npm package manager for node.js. Go to the:

	https://github.com/isaacs/npm
	
and follow the installation instructions. When you have npm successfully installed do:

	npm install platformjs

## Usage

PlatformJS is intended to be used in combination with your own server. Of course there is the mode to run it as standalone
server, which is able to handle requests on its own, but I think more common case will be that server will be attached
to your own server you have already created.

Its just enough to call the .listen() method of the main websocket server class to attach it to your server. You can close
it whenever you want by calling .close() method of the very same class. And that is basically it.
	
### Standalone

Run the command:

	bin/platformjs

This will start new server on port 8000.
	
Note:
There is the testing JavaScript application in public/ folder which can be used to test the server. It works in any browser
which support the websocket protocol (latest draft76).
		
### Add to your server

	// Require the platformjs script
	var pjs = require('platformjs')
	
	// Create instance of your server
	var your_server = http.createServer(...)
	
	// Attach websocket server
	var platformjs = new pjs.Server()
	platformjs.listen(your_server)

## Development

## Licence

Copyright (c) 2011 Petr Janda

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.