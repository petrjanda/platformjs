username = process.ARGV[2]
password = process.ARGV[3]
keyword  = process.ARGV[4]

sys			= require 'sys'
events		= require 'events'
Twitter		= require './twitter'
PlatformJS	= require 'platformjs'

unless username? and password?
	console.log "Usage: node index.js <twitter_username> <twitter_password>"
	process.exit 1

TwitterServer = () ->
	PlatformJS.call(this)

	@twitter = new Twitter()
	@twitter.on Twitter.NEW_TWEET, (tweet) =>
		console.log '[twitter] New tweet'
		@clients.broadcast(JSON.stringify(tweet))

	@twitter.login username, password	
	@twitter.track()
	

sys.inherits(TwitterServer, PlatformJS)


server = new TwitterServer()
server.listen()
