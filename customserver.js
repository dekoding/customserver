/* Custom Server 0.0.1
 * Copyright Damon Kaswell, 2015
 * Released under the Apache 2.0 License. Do with it as you will, so long as it
 * is in accordance with this licence.
 *
 * CustomServer is designed with the idea of being both easily customized and
 * easy to implement as-is. The default options are intended to be both sane for
 * developers and easily understood 
 */

///////////////////////////////////////////////////////////////////////////
//////////////////////////USER CONFIGURATION///////////////////////////////
///////////////////////////////////////////////////////////////////////////

/* Make most changes in the section below to suit your needs. Everything else
 * can also be modified as necessary, but unless you really know what you're
 * doing, CustomServer is designed with most common customizations here.
 */

/* SERVER ADDRESS AND PORT
 * If you need the server to wait on additional addresses and/or ports, you
 * can add them here. By default, CustomServer will only wait on the
 * loopback address, 127.0.0.1, to ensure that the server is not accessible
 * from other computers.
 */
var SERVER_ADDRESSES = [ '127.0.0.1' ];
var SERVER_PORTS = [ 1337 ];

/* SSL
 * If your server will require SSL, set USE_SSL = 1 and tell CustomServer
 * the paths for your key and cert files. You can also customize the port
 * used by SSL.
 */
var USE_SSL = 0;
var KEY = '/path/to/key';
var CERT = '/path/to/cert';
var SSL_PORTS = [ 443 ];

/* DEFAULT PATH AND HTML
 * You can customize the default application directory and HTML file used by
 * CustomServer here.
 */
var APP_DIR = "./app";
var DEFAULT_HTML = 'index.html';

/* DEFAULT ERROR HANDLING
 * If you want specific errors to be displayed during specific failures,
 * modify the files below or add your own.
 */
var ERROR_400 = './resources/error400.html';
var ERROR_401 = './resources/error401.html';
var ERROR_403 = './resources/error403.html';
var ERROR_404 = './resources/error404.html';
var ERROR_500A = './resources/error500A.html';
var ERROR_500B = './resources/error500B.html';

/* DEFAULT MIME TYPES
 * CustomServer will automatically handle any file with the following file
 * extensions as their associated mimetypes. If the server is configured to
 * permit unknown/unrecognized file types, such as those with different
 * extensions, CustomServer will attempt to autodetect the file's mimetype.
 *
 * NOTE 1: Autodetection is ONLY supported on Linux and Windows!
 *
 * NOTE 2: A complete list of mimetypes is available at:
 * http://www.iana.org/assignments/media-types/media-types.xhtml
 */
var EXTENSIONS = {
	//".php" : "application/php", // Uncommment if you run PHP on your server and need to be able to pass it commands.
	".html" : "text/html",			
	".js": "application/javascript",
	".json": "application/json", 
	".css": "text/css",
	".txt": "text/plain",
	".jpg": "image/jpeg",
	".gif": "image/gif",
	".png": "image/png",
	".ico": "image/ico"
};

/* UNRECOGNiZED FILE TYPES
 * To permit files that have unknown extensions or don't have extensions to
 * be processed, change ALLOW_UNKNOWN_FILETYPES to 1.
 *
 * NOTE: This is not necessarily safe!
 */
var ALLOW_UNKNOWN_FILETYPES = 0;

/* DIRECTORY LISTING
 * To enable directory listing, set ALLOW_DIR_LISTING to 1.
 * 
 * NOTES: This is not necessarily safe!
 */
var ALLOW_DIR_LISTING = 1;

/* API CALLS
 * To enable interactive features, set ENABLE_API to 1, and add your program's
 * interactive components to the function processAPI().
 */
var ENABLE_API = 0;

function processAPI(req, res) {
	console.log(customServer.timeStamp() + ": PLACEHOLDER: Please customize processAPI()." + 
		"Requested URL was " + req.url + " and requested method was " + req.method);
	res.end("PLACEHOLDER: Please customize processAPI()." + 
		"Requested URL was " + req.url + " and requested method was " + req.method);
}

/* END USER CONFIGURATION
 *
 * If you really need to make more customizations, feel free to do so.
 */

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// Basic setup
if(USE_SSL===1) {
	var https = require('https');
	var SSL_OPTIONS = {
		key: fs.readFileSync(KEY),
		cert: fs.readFileSync(CERT)
	};
} else {
	var http = require('http');
}

if(ALLOW_UNKNOWN_FILETYPES === 1 || ALLOW_DIR_LISTING === 1) {
	var os = require('os');
	var exec = require('child_process').exec;
}
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

// Build server
var customServer = {

	timeStamp : function() {
		var now = new Date();

		// Create an array with the current month, day and time
		var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

		// Create an array with the current hour, minute and second
		var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

		// Determine AM or PM suffix based on the hour
		var suffix = ( time[0] < 12 ) ? "AM" : "PM";

		// Convert hour from military time
		time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

		// If hour is 0, set it to 12
		time[0] = time[0] || 12;

		// If seconds and minutes are less than 10, add a zero
		for ( var i = 1; i < 3; i++ ) {
			if ( time[i] < 10 ) {
				time[i] = "0" + time[i];
			}
		}

		// Return the formatted string
		return date.join("/") + " " + time.join(":") + " " + suffix;
	},

	getFile : function(filename, res, mimetype) {
		fs.readFile(filename, function(err, contents) {
			if(err) {
				customServer.error("500B");
			} else {
				res.setHeader("Content-Length", contents.length);
				res.setHeader("Content-Type", mimetype);
				res.statusCode = 200;
				res.write(contents);
				res.end();
			}
		});
	},

	getDir : function(directory, req, res) {
		var trailingSlash = req.url.substr(req.url.length - 1);
		if(trailingSlash === "/" ) {
			var url = req.url;
			fs.readdir(directory, function (err, files) {
				if (err) {
					throw err;
				} else {
					res.setHeader("Content-Type", "text/html");
					res.write('<!doctype html><html><head><title>Index of ' + url + '</title></head><body bgcolor="white"><h1>Index of ' + url + '</h1><hr><pre>Path/Filename<br/>-------------<br/><a href="../">../</a><br/>');
					var filesSorted = [];
					var dirsSorted = [];

					files.forEach(function(file) {
						var fileObj = directory + file;
						stats = fs.lstatSync(fileObj);
						if(stats.isDirectory()) {
							dirsSorted.push({
								"dirname" : file,
								"creation" : stats['birthtime']
							});
						} else {
							filesSorted.push({
								"filename" : file,
								"size" : stats['size'],
								"creation" : stats['birthtime']
							});
						}
					});

					dirsSorted.sort().forEach(function(dir) {
						var content = '<a href="' + dir.dirname + '/">' + dir.dirname + '/</a>';
						var characters = dir.dirname.toString().length;
						var spaces = 99-characters;
						for(i=0; i<spaces; i++) {
							content += " ";
						}
						content += dir.creation + '<br/>';
						res.write(content);
					});
					filesSorted.sort().forEach(function(file) {
						var content = '<a href="' + file.filename + '">' + file.filename + '</a>';
						var characters = file.filename.toString().length;
						var spaces = 100-characters;
						for(i=0; i<spaces; i++) {
							content += " ";
						}
						content += file.creation + '          -          ' + file.size + '<br/>';
						res.write(content);
					});
					res.end('</pre><hr></body></html>');
				}
			});
		} else {
			res.writeHead(301,
				{Location: req.url + "/"}
			);
			res.end();
		}
	},

	error : function(type, res) {
		var file;
		switch(type) {
			case "400": var head=400; file = ERROR_400; break;
			case "401": var head=401; file = ERROR_401; break;
			case "403": var head=403; file = ERROR_403; break;
			case "404": var head=404; file = ERROR_404; break;
			case "500A": var head=500; file = ERROR_500A; break;
			case "500B": var head=500; file = ERROR_500B; break;
			default : var head=500; file = ERROR_500B;
		}
		fs.readFile(file, function(err, contents) {
			if(err) {
				console.log(customServer.timeStamp() + ": Internal error! Unable to parse error message for display! Switching to failsafe error.");
				res.writeHead(500);
				res.end('The server has experienced a critical internal error.');
			} else {
				res.writeHead(head, {"Content-Type": "text/html"});
				res.write(contents);
				res.end();
			}
		});
	},

	getUnknownFile : function(filename, res) {
		var mimetype;
		var OS = os.platform();
		if(OS === "linux") {
			exec('file -b --mime-type ' + filename, function(error, stdout, stderr) {
				if(error === null) {
					console.log(customServer.timeStamp() + ": Mimetype identified as: " + stdout);
					mimetype = stdout;
					customServer.getFile(filename, res, mimetype);
				} else {
					console.log(customServer.timeStamp() + ": Unable to execute mimetype detection! Threw error: " + error);
					customServer.error("500B", res);
				}
			});
		} else {
			console.log(customServer.timeStamp() + ": Operating system type '" + OS + "' is UNSUPPORTED! Returning error 500.");
			customServer.error("500B", res);
		}
	},

	process : function(req, res) {
		if(req.method === 'POST') {
			if(ENABLE_API === 1) {
				// Bypass everything else and go straight to processAPI, since something has been posted.
				console.log(customServer.timeStamp() + ": Client made POST request. Passing to processAPI().");
				processAPI(req, res);
			} else {
				// Posting is not allowed to this server. Return 500 error.
				console.log(customServer.timeStamp() + ": Client made unsupported POST request. Returning error 500.");
				customServer.error("500B", res);
			}
		}

		var url;

		if(req.url === "/") {
			// Top-level request. Set URL to default.
			url = APP_DIR + "/" + DEFAULT_HTML;
		} else {
			// Requested a specific file, location, or API.
			url = APP_DIR + req.url;
		}
		console.log(customServer.timeStamp() + ": Client requested: " + url);
		fs.stat(url, function(err, stats){
			if(err === null) {
				// Client requested a file or directory
				console.log(customServer.timeStamp() + ": Client requested a URL that EXISTS.");
				if(stats.isFile()) {
					// Client requested a file
					console.log(customServer.timeStamp() + ": Requested URL is a file. Testing extension validity...");
					var filename = url;

					if(path.extname(filename)) {
						// File has an extension. Check to see if it's on the list.
						var ext = path.extname(filename);
						var isValidExt = EXTENSIONS[ext];
						if (isValidExt) {
							// Extension is on the list. Serve it to the client
							console.log(customServer.timeStamp() + ": File extension " + ext + " is KNOWN. Providing to client.");
							customServer.getFile(filename, res, EXTENSIONS[ext]);
						} else {
							// Extension is not on the list. Check if unknown extensions are allowed.
							if(ALLOW_UNKNOWN_FILETYPES === 1) {
								console.log(customServer.timeStamp() + ": File extension '" + ext + "' is UNKNOWN. Detecting mimetype...");
								customServer.getUnknownFile(filename, res)
							} else {
								console.log(customServer.timeStamp() + ": File extension '" + ext + "' is UNKNOWN. Returning error 500.");
								customServer.error("500A", res);
							}
						}
					} else {
						// File does NOT have an extension and is NOT a directory. Unless unknown file types are allowed, throw an error.
						if(ALLOW_UNKNOWN_FILETYPES === 1) {
							console.log(customServer.timeStamp() + ": File has no extension. Detecting mimetype...");
							customServer.getUnknownFile(filename, res)
						} else {
							console.log(customServer.timeStamp() + ": File has no extension. Returning error 500.");
							customServer.error("500A", res);
						}
					}
				} else if(stats.isDirectory()) {
					// Client requested a directory
					if(ALLOW_DIR_LISTING === 1) {
						console.log(customServer.timeStamp() + ": Requested URL is a directory. Returning directory listing...");
						var directory = url;
						customServer.getDir(directory, req, res);
					} else {
						console.log(customServer.timeStamp() + ": Requested URL is a directory. Directory listing denied.");
						customServer.error("403", res);
					}

				} else {
					// URL is a file without an extension.
					console.log(customServer.timeStamp() + ": Requested URL is not an intelligible resource. Returning error 500.");
					customServer.error("500B", res);
				}
			} else {
				// Client requested a non-existent URL. Either use processAPI() or reject outright.
				if(ENABLE_API === 1) {
					// API processing is enabled. Pass control to processAPI() to decide what to do.
					console.log(customServer.timeStamp() + ": Requested URL does not exist. Passing to processAPI() for further processing.");
					processAPI(req, res);
				} else {
					console.log(customServer.timeStamp() + ": Requested URL does not exist. Returning error 404.");
					customServer.error("404", res);
				}
			}
		});
	},

	init : function(req, res) {
		if(USE_SSL === 1) {
			// Starting a secure server.
			console.log(customServer.timeStamp() + ": CustomServer starting in SSL mode on these addresses/ports:");
			SERVER_ADDRESSES.forEach(function(address) {
				SSL_PORTS.forEach(function(port) {
					console.log("                       " + address + "/" + port);
					https.createServer(SSL_OPTIONS, function (req, res) {
						customServer.process(req, res);
					}).listen(port, address);
				});
			});
		} else {
			console.log(customServer.timeStamp() + ": CustomServer starting on these addresses/ports:");
			SERVER_ADDRESSES.forEach(function(address) {
				SERVER_PORTS.forEach(function(port) {
					console.log("                       " + address + "/" + port);
					http.createServer(function (req, res) {
						customServer.process(req, res);
					}).listen(port, address);
				});
			});
		}
	}
}

customServer.init();