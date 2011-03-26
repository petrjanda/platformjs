require './spec_helper'

Log	= require 'log'

describe 'Log', ->
	describe "when disabled", ->
		it "should not write any output", ->
			spyOn console, 'log'
			Log.info('title', 'text')
			expect(console.log).not.toHaveBeenCalled()
		
	describe "when enabled", ->
		beforeEach ->
			Log.enabled = true
			
		afterEach ->
			Log.enabled = false
		

		it "should log info messages", ->
			spyOn console, 'log'
			Log.info('title', 'text')
			expect(console.log).toHaveBeenCalled()