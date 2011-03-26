Log = module.exports = () ->

Log.greenify = (text) ->
	text = Log.GREEN + text + Log.GRAY

Log.GREEN	= "\033[1;32m"
Log.GRAY	= "\033[0;37m"

Log.info = (title, text) ->
	if Log.enabled
		console.log Log.greenify(title) + ' ' + text
		
Log.error = (title, text) ->
	if Log.enabled
		console.log Log.greenify(title) + ' ' + text		
	
Log.enabled = false