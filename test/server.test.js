require('./init');

var platformjs = require('platformjs')
    express = require('express')
  , should = require('should');

var server = express.createServer();

var pjss = new platformjs.Server();

pjss.listen(server);

module.exports = {
	
	'should have clients manager': function() {
		pjss.should.have.property('clients');
	}
}