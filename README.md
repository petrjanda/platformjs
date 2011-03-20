# PlatformJS

## Installation

To be able to use PlatformJS on your system, you can install it with npm package manager

	npm install platformjs

## Usage

When you have successfully installed platformjs package you can use the websocket server multiple ways.
	
### Standalone

Run the command:

	platformjs
	
For additional parameters you can pass run the:

	platformjs help
	
### Add to your server

There is simple way to attach the PlatformJS to your own webserver you have created with http.createServer or
any of inherited solutions like for instance express.

To be able to do that do:

	// Require the platformjs script
	var pjs = require('platformjs')
	
	// Create instance of your server
	var your_server = http.createServer(...)
	
	// Attach websocket server
	pjs.listen(your_server)

## Development

## Licence

MIT
