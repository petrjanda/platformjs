sys 	= require 'sys'
http	= require 'http'
events 	= require 'events'
base64	= require './base64'

Twitter = module.exports = () ->
	@port = 80
	@host = 'stream.twitter.com'
	
	@buffer = ''
	
sys.inherits(Twitter, events.EventEmitter)
	
Twitter.prototype.login = (username, password) ->
	@username = username
	@password = password
	
#
# Connect to Twitter Streaming API and load the real-time streams for London.
#
Twitter.prototype.track = () ->

	center = [-0.1275, 51.507222]
	range = .5
	topLeft = [center[0] - range, center[1] - range]
	bottomRight = [center[0] + range, center[1] + range]

	body = 'locations=' + topLeft[0] + ',' + topLeft[1] + ',' + bottomRight[0] + ',' + bottomRight[1]
	auth = base64.encode(@username + ':' + @password);
	options =
		host: 'stream.twitter.com'
		port: 80
		path: '/1/statuses/filter.json'
		method: 'POST'
		headers:
			'Authorization' : "Basic " + auth
			'Content-Type' : 'application/x-www-form-urlencoded'
			'Content-Length' : body.length
		
	req = http.request options, (res) =>
		console.log res.statusCode + ' ' + JSON.stringify(res.headers)
		res.setEncoding('utf8')
		res.on 'data', (chunk) =>
			@buffer += chunk
			while (index = @buffer.indexOf('\r\n')) > -1
				json = @buffer.slice(0, index);
				@buffer = @buffer.slice(index + 2);
				
				if json.length > 0
					try
						json = JSON.parse(json);
						@emit Twitter.NEW_TWEET, json
					catch e
						console.log e

	req.write(body)
	req.end()
	
Twitter.NEW_TWEET = 'newTweet'


#	TWEET FORMAT
#
#	{
#		"contributors":null,
#		"place":null,
#		"user": {
#			"is_translator":false,
#			"friends_count":93,
#			"default_profile_image":false,
#			"time_zone":null,
#			"favourites_count":0,
#			"profile_text_color":"000000",
#			"followers_count":33,
#			"url":null,
#			"show_all_inline_media":false,
#			"following":null,
#			"geo_enabled":false,
#			"profile_sidebar_fill_color":"7C7C7C",
#			"id_str":"272259174",
#			"contributors_enabled":false,
#			"profile_background_tile":true,
#			"default_profile":false,
#			"follow_request_sent":null,
#			"verified":false,
#			"statuses_count":451,
#			"profile_link_color":"000000",
#			"description":"Draco that sexy Malfoy (multiple rps)",
#			"profile_sidebar_border_color":"C0DEED",
#			"created_at":"Sat Mar 26 04:29:47 +0000 2011",
#			"protected":false,
#			"listed_count":0,
#			"profile_use_background_image":true,
#			"profile_image_url":"http:\/\/a1.twimg.com\/profile_images\/1287417461\/images_normal.jpg",
#			"location":"Malfoy Manor ",
#			"name":"Draco Malfoy ",
#			"profile_background_color":"C0DEED",
#			"id":272259174,
#			"lang":"en",
#			"notifications":null,
#			"profile_background_image_url":"http:\/\/a1.twimg.com\/profile_background_images\/222805714\/x84c80970d471a5f5a0ad337a9105e0b.png",
#			"utc_offset":null,
#			"screen_name":"DracoLMalfoy_"
#	},
#	"retweeted":false,
#	"in_reply_to_user_id":266938062,
#	"in_reply_to_user_id_str":"266938062",
#	"retweet_count":0,
#	"text":"@katelynm98 Oh... (puts the ring on) Well then.. anything else I need to know?",
#	"id_str":"52024624304758784",
#	"coordinates":null,
#	"in_reply_to_status_id":52024224583401472,
#	"source":"\u003Ca href=\"http:
#	\/\/www.tweetdeck.com\" rel=\"nofollow\"\u003ETweetDeck\u003C\/a\u003E",
#	"truncated":false,
#	"favorited":false,
#	"created_at":"Sun Mar 27 15:10:11 +0000 2011",
#	"geo":null,
#	"in_reply_to_screen_name":"katelynm98",
#	"id":52024624304758784,
#	"in_reply_to_status_id_str":"52024224583401472",
#	"entities":{
#		"hashtags":[],
#		"user_mentions":[
#			{
#				"indices":[0,11],
#				"id_str":"266938062",
#				"name":"Katelyn Mathis",
#				"id":266938062,
#				"screen_name":"katelynm98"
#			}
#		],
#		"urls":[]}}