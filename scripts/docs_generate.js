var fs = require( 'fs' );
var path = require( 'path' );

var contractDir = "./contracts/";
var targetDir = "./docs/contracts.md/";

var exec = require('child_process').exec;

// Loop through all the files in the temp directory
fs.readdir( contractDir, function( err, files ) {
        if( err ) {
            console.error( "Could not list the directory.", err );
            process.exit( 1 );
        } 

        files.forEach( function( file, index ) {
				console.log("Generating markdown documentation for file " + file + "...");
				var targetFileName = file.split('.')[0] + ".md";
				var execString = "call ./node_modules/.bin/solmd.cmd ./contracts/" + file + " --dest " + targetDir + targetFileName;
				console.debug("Command to execute: " + execString);
				var child = exec(execString,
					function (error, stdout, stderr) {
						if (stdout != null && stdout.trim() != "")
							console.log("----------[" + file + "]----------\n" + stdout);
						if (stderr != null && stderr.trim() != "")
							console.log("----------[" + file + "]----------\n" + stderr);
						if (error !== null) {
							 console.log("----------[" + file + "]----------\n" + error);
						}
					});
				
		} );
} );