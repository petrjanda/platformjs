exec	= require('child_process').exec

task 'doc', 'Generate docco documentation for all source files', ->
	exec 'docco src/*.coffee', (error, stdout, stderr) ->
		if error
			console.log 'Docs failed'
		else
			console.log 'Docs successfull'
			
task 'build', 'Build all application', ->
	child = exec 'coffee -b -o lib/ -c src/', (error, stdout, stderr) ->
		console.log 'stdout: ' + stdout
		console.log 'stderr: ' + stderr

		if error
			console.log 'Build failed.'
			console.log 'exec error: ' + error
		else
			console.log 'Build successfull.'