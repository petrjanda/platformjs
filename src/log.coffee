Log = module.exports = () ->

Log.greenify = (text) ->
	text = Log.GREEN + text + Log.GRAY

Log.GREEN	= "\033[1;32m"
Log.GRAY	= "\033[0;37m"