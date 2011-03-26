Log = module.exports = () ->

Log.colorize = (text, color) ->
	text = color + text + Log.GRAY

Log.GREEN	= "\033[1;32m"
Log.GRAY	= "\033[0;37m"
Log.RED		= "\033[0;31m"

Log.info = (title, text) ->
	if Log.enabled
		console.log Log.colorize(title, Log.GREEN) + ' ' + text
		
Log.error = (title, text) ->
	if Log.enabled
		console.log Log.colorize(title, Log.RED) + ' ' + text		
	
Log.enabled = false