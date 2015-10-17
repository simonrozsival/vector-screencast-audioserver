var path = require("path");
var fs = require("fs");

// read node modules and mark it as "externals"
var nodeModules = {};
fs.readdirSync('node_modules')
	.filter(function(x) {
    	return ['.bin'].indexOf(x) === -1;
  	})
  	.forEach(function(mod) {
    	nodeModules[mod] = 'commonjs ' + mod;
  	});

module.exports = {
	
	entry: path.resolve(__dirname, "./src/AudioRecording.ts"),	
	output: {
		path: path.join(__dirname, "./release/"),
		filename: "audio-server.js"
	},
	devtool: "source-map",
	target: "node",
	resolve: {
		extensions: [ "", ".ts" ],
		modulesDirectories: [ './node_modules' ]
	},
	
	module: {
		loaders: [
			{ 
				test: /.ts$/,
				loaders: [ "babel", "ts" ],
				exclude: [ /node_modules/ ]			
			}		
		]
	},
	externals: nodeModules
};