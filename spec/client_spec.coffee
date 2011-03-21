require './spec_helper'
Client = require 'client'

describe "Client", ->
	beforeEach ->
	  @client = new Client(null, null, {on: () ->})
	
	it "should be valid", ->
		expect(@client).toBeDefined()
	
	