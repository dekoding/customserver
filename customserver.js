/* Custom Server 0.0.2
 * Copyright Damon Kaswell, 2015
 * Released under the Apache 2.0 License. Do with it as you will, so long
 * as it is in accordance with this licence.
 *
 * CustomServer is designed with the idea of being both easily customized
 * and easy to implement as-is. The default options are intended to be both
 * sane for developers and easily understood  */

///////////////////////////////////////////////////////////////////////////
//////////////////////////USER CONFIGURATION///////////////////////////////
///////////////////////////////////////////////////////////////////////////

/* Make most changes in the section below to suit your needs. Everything
 * else can also be modified as necessary, but unless you really know what
 * you're doing, CustomServer is designed with most common customizations
 * here. */

/* SERVER ADDRESS AND PORT
 * If you need the server to wait on additional addresses and/or ports, you
 * can add them here. By default, CustomServer will only wait on the
 * loopback address, 127.0.0.1, to ensure that the server is not accessible
 * from other computers. */
var SERVER_ADDRESSES = [ '127.0.0.1' ];
var SERVER_PORTS = [ 1337 ];

/* SSL
 * If your server will require SSL, set USE_SSL = 1 and tell CustomServer
 * the paths for your key and cert files. You can also customize the port
 * used by SSL. */
var USE_SSL = 0;
var KEY = '/path/to/key';
var CERT = '/path/to/cert';
var SSL_PORTS = [ 443 ];

/* DEFAULT PATH AND HTML
 * You can customize the default application directory and HTML file used
 * by CustomServer here. */
var APP_DIR = './app';
var DEFAULT_HTML = 'index.html';

/* DEFAULT ERROR HANDLING
 * By default, CustomServer automatically generates error pages for you. If
 * you want to create your own error pages, then set USE_CUSTOM_ERROR_PAGES
 * to 1. CustomServer expects error pages to be located in the folder
 * specified in CUSTOM_ERROR_DIR.
 * 
 * Custom error pages should be named in the format <error_code>.html. For
 * example, a 404 error will attempt to retrieve the file:
 *
 *			CUSTOM_ERROR_DIR + 404.html
 *
 */
var USE_CUSTOM_ERROR_FILES = 0;
var CUSTOM_ERROR_DIR = './app';

/* DEFAULT ERROR MESSAGES
 * In addition to customizing the error pages, you can customize the message
 * text used by CustomServer's default error handling.
 *
 * The following error codes should handle most use cases, but if you are
 * customizing the server to process interactive requests and handle
 * authentication, you will probably need to add more and make direct
 * adjustments to the customServer.error() function. */

var ERROR_400 = 'Invalid command issued to server! Check your link and try again.';
var ERROR_401 = 'You are not authorized to access this resource.';
var ERROR_403 = 'Directory listing denied.';
var ERROR_404 = 'File or resource not found. Check your link and try again.';
var ERROR_500 = 'Internal server error. The server cannot provide the resource requested. Check your link and try again.';

/* DEFAULT MIME TYPES
 * CustomServer will automatically handle any file with the following file
 * extensions as their associated mimetypes. If the server is configured to
 * permit unknown/unrecognized file types, such as those with different
 * extensions, CustomServer will attempt to autodetect the file's mimetype.
 *
 * NOTE 1: Autodetection is ONLY supported on Linux!
 *
 * NOTE 2: A complete list of mimetypes is available at:
 * http://www.iana.org/assignments/media-types/media-types.xhtml */

var EXTENSIONS = {
	// Uncommment if you run PHP and need to be able to pass it commands.
	//".php" : "application/php",
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
 * be processed, change ALLOW_UNKNOWN_FILETYPES to 1. Linux-only.
 *
 * NOTE: This is not necessarily safe!
 */
var ALLOW_UNKNOWN_FILETYPES = 0;

/* DIRECTORY LISTING
 * To enable directory listing, set ALLOW_DIR_LISTING to 1.
 * 
 * NOTE: This is not necessarily safe!
 */
var ALLOW_DIR_LISTING = 0;

/* API CALLS
 * To add interactive features, set ENABLE_API to 1, and add your
 * program's interactive components to the function processAPI().
 */
var ENABLE_API = 0;

function processAPI(req, res) {
	utilities.log("PLACEHOLDER: Please customize processAPI()." + 
		"Requested URL was " + req.url + " and requested method was " + req.method);
	res.end("PLACEHOLDER: Please customize processAPI()." + 
		"Requested URL was " + req.url + " and requested method was " + req.method);
}

/* ADDITIONAL REQUIRES
 * If you're using the API, you probably need additional modules. Add them
 * here.
 */
//var MyModule = require('mymodule');

/* END USER CONFIGURATION
 *
 * If you really need to make more customizations, feel free to do so.
 */

///////////////////////////////////////////////////////////////////////////
/////////////////////////HERE THERE BE DRAGONS/////////////////////////////
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

// Build utilities
var utilities = {
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
		return date.join("/") + " " + time.join(":") + " " + suffix + ": ";
	},
	log : function(message) {
		console.log(utilities.timeStamp() + message)
	}
}

var fileSystem = {
	getFile : function(filename, res, mimetype) {
		fs.readFile(filename, function(err, contents) {
			if(err) {
				customServer.error("500", res);
			} else {
				res.setHeader("Content-Length", contents.length);
				res.setHeader("Content-Type", mimetype);
				res.statusCode = 200;
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
					utilities.log("Mimetype identified as: " + stdout);
					mimetype = stdout;
					fileSystem.getFile(filename, res, mimetype);
				} else {
					utilities.log("Unable to execute mimetype detection! Threw error: " + error);
					customServer.error("500", res);
				}
			});
		} else {
			utilities.log("Operating system type '" + OS + "' is UNSUPPORTED! Returning error 500.");
			customServer.error("500", res);
		}
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
	}
}

// Build server
var customServer = {

	error : function(type, res) {

		var head;
		if(USE_CUSTOM_ERROR_FILES === 1) {
			// The error pages have been customized. Retrieve the appropriate page.
			var errorFile;
			switch(type) {
				case "400": head = 400; errorFile = CUSTOM_ERROR_DIR + '/400.html'; break;
				case "401": head = 401; errorFile = CUSTOM_ERROR_DIR + '/401.html'; break;
				case "403": head = 403; errorFile = CUSTOM_ERROR_DIR + '/403.html'; break;
				case "404": head = 404; errorFile = CUSTOM_ERROR_DIR + '/404.html'; break;
				case "500": head = 500; errorFile = CUSTOM_ERROR_DIR + '/500.html'; break;
				default : head = 500; errorFile = CUSTOM_ERROR_DIR + '/500.html'; break;
			}
			fs.readFile(errorFile, function(err, contents) {
				if(err) {
					utilities.log("Internal error! Unable to parse error message for display! Switching to failsafe error.");
					res.writeHead(500);
					res.end('The server has experienced a critical internal error.');
				} else {
					res.writeHead(head, {"Content-Type": "text/html"});
					res.write(contents);
					res.end();
				}
			});
		} else {
			var errorText;
			var head;
			switch(type) {
				case "400": head = 400; errorText = ERROR_400; break;
				case "401": head = 401; errorText = ERROR_401; break;
				case "403": head = 403; errorText = ERROR_403; break;
				case "404": head = 404; errorText = ERROR_404; break;
				case "500": head = 500; errorText = ERROR_500; break;
				default : head = 500; errorText = ERROR_500;
			}
			res.writeHead(head);
			res.write('<!DOCTYPE HTML>' +
				'<html>' +
				'<head>' +
					'<meta charset="utf-8" />' +
					'<meta name="author" content="Damon Kaswell" />' +
					'<title>' + head + '</title>' +
						'<link href="http://fonts.googleapis.com/css?family=Open+Sans:400,700" rel="stylesheet" type="text/css" />' +
				        '<style>' +
				            '.notice {' +
				                'font-family: "Open Sans", arial, sans-serif;' +
				                'padding: 10px;' +
				                'border: 1px solid;' +
				                'background: #979;' +
				            '}' +
				        '</style>' +
				    '</head>' +
					'<body>' +
						'<h1>' + head + '</h1>' +
						'<div class="notice">' + errorText + '</div>' +
					'</body>' +
				'</html>');
			res.end();
		}
	},

	process : function(req, res) {
		if(req.method !== 'GET') {
			if(ENABLE_API === 1) {
				// Bypass everything else and go straight to processAPI, since a method other than GET was used.
				utilities.log("Client used " + req.method + " method. Passing to processAPI().");
				processAPI(req, res);
			} else {
				// Posting is not allowed to this server. Return 500 error.
				utilities.log("Client used unsupported " + req.method + " method. Returning error 500.");
				customServer.error("500", res);
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
		utilities.log("Client requested: " + url);
		fs.stat(url, function(err, stats){
			if(err === null) {
				// Client requested a file or directory
				utilities.log("Client requested a URL that EXISTS.");
				if(stats.isFile()) {
					// Client requested a file
					utilities.log("Requested URL is a file. Testing extension validity...");
					var filename = url;

					if(path.extname(filename)) {
						// File has an extension. Check to see if it's on the list.
						var ext = path.extname(filename);
						var isValidExt = EXTENSIONS[ext];
						if (isValidExt) {
							// Extension is on the list. Serve it to the client
							utilities.log("File extension " + ext + " is KNOWN. Providing to client.");
							fileSystem.getFile(filename, res, EXTENSIONS[ext]);
						} else {
							// Extension is not on the list. Check if unknown extensions are allowed.
							if(ALLOW_UNKNOWN_FILETYPES === 1) {
								utilities.log("File extension '" + ext + "' is UNKNOWN. Detecting mimetype...");
								fileSystem.getUnknownFile(filename, res)
							} else {
								utilities.log("File extension '" + ext + "' is UNKNOWN. Returning error 500.");
								customServer.error("500", res);
							}
						}
					} else {
						// File does NOT have an extension and is NOT a directory. Unless unknown file types are allowed, throw an error.
						if(ALLOW_UNKNOWN_FILETYPES === 1) {
							utilities.log("File has no extension. Detecting mimetype...");
							fileSystem.getUnknownFile(filename, res)
						} else {
							utilities.log("File has no extension. Returning error 500.");
							customServer.error("500", res);
						}
					}
				} else if(stats.isDirectory()) {
					// Client requested a directory
					if(ALLOW_DIR_LISTING === 1) {
						utilities.log("Requested URL is a directory. Returning directory listing...");
						var directory = url;
						fileSystem.getDir(directory, req, res);
					} else {
						utilities.log("Requested URL is a directory. Directory listing denied.");
						customServer.error("403", res);
					}

				} else {
					// URL is a file without an extension.
					utilities.log("Requested URL is not an intelligible resource. Returning error 500.");
					customServer.error("500", res);
				}
			} else {
				// Client requested a non-existent URL. Either use processAPI() or reject outright.
				if(ENABLE_API === 1) {
					// API processing is enabled. Pass control to processAPI() to decide what to do.
					utilities.log("Requested URL does not exist. Passing to processAPI() for further processing.");
					processAPI(req, res);
				} else {
					utilities.log("Requested URL does not exist. Returning error 404.");
					customServer.error("404", res);
				}
			}
		});
	},

	init : function(req, res) {
		if(USE_SSL === 1) {
			// Starting a secure server.
			utilities.log("CustomServer starting in SSL mode on these addresses/ports:");
			SERVER_ADDRESSES.forEach(function(address) {
				SSL_PORTS.forEach(function(port) {
					console.log("                       " + address + "/" + port);
					https.createServer(SSL_OPTIONS, function (req, res) {
						customServer.process(req, res);
					}).listen(port, address);
				});
			});
		} else {
			utilities.log("CustomServer starting on these addresses/ports:");
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
