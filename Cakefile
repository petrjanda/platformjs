exec	= require('child_process').exec

task 'doc', 'Generate docco documentation for all source files', ->
	exec 'docco src/*.coffee', (error, stdout, stderr) ->
		if error
			console.log 'Docs failed'
		else
			console.log 'Docs successfull'