require('./init');

var platformjs = require('platformjs')
    express = require('express')
  , should = require('should');

var server = express.createServer();
var pjss = new platformjs.Server();

pjss.listen(server);

module.exports = {
	
	'server should have clients manager': function() {
		pjss.should.have.property('clients');
	},
	
	'server clients manager should have clients list': function() {
		pjss.clients.should.have.property('list');
	},
	
	'server clients manager list should be empty': function() {
		pjss.clients.should.have.property('count', 0);
		pjss.clients.list.should.eql({});
	}
}