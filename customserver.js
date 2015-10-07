/* Custom Server 0.0.1
 * Copyright Damon Kaswell, 2015
 * Released under the Apache 2.0 License. Do with it as you will, so long as it
 * is in accordance with this licence.
 *
 * MANIFESTO
 * The goal here is to include the minimum set of built-in modules to handle
 * everything a regular web server needs to be able to handle. A web server
 * should:
 *    - Allow access to standard file types (HTML, images, etc.)
 *    - Elegantly handle bad URLs
 *    - Accept GET and POST requests (For interactive apps)
 *
 * The end result should be a server that is usable for static pages
 * immediately, and is quick and easy to customize for interactive pages with
 * a minimum of fuss.
 *
 * This is NOT a server that needs an extensive set of add-on modules to be
 * fully functional. It is ideal for the frontend developer who wants to just
 * start writing HTML and JavaScript immediately and have it work.
 *
 * To develop interactive apps that send, receive, and store data in a
 * database or file on the node.js host, you will of course need whatever
 * modules are required for that project.
 */

// Basic requires
var http = require('http');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

/* USER CONFIGURATION
 *
 * Make most changes here to suit your needs. Everything else can also be
 * changed as necessary, but unless you really know what you're doing,
 * CustomServer is designed with most common customizations here.
 */

// Server port and URL configuration
var port = 1337;
var serverUrl = "127.0.0.1";

// Error handling
var error400 = '<!doctype html><html><head><title>400</title></head><body><h1>400</h1>' + 
	'<p>Invalid command issued to server! Check your link and try again.</p></body></html>';
var error401 = '<!doctype html><html><head><title>401</title></head><body><h1>401</h1>' + 
	'<p>Access denied!</p></body></html>';
var error403 = '<!doctype html><html><head><title>403</title></head><body><h1>403</h1>' + 
	'<p>Directory listing denied!</p></body></html>';
var error404 = '<!doctype html><html><head><title>404</title></head><body><h1>404</h1>' + 
	'<p>File or resource not found! Check your link and try again.</p></body></html>';
var error500A = '<!doctype html><html><head><title>500</title></head><body><h1>500</h1>' + 
	'<p>File or resource type not recognized! Check your link and try again.</p></body></html>';
var error500B = '<!doctype html><html><head><title>500</title></head><body><h1>500</h1>' + 
	'<p>Internal server error! Check your link and try again.</body></html>';

// Default app location and HTML file.
var appDir = "./app/";
var defaultHTML = "index.html";

// Default file extensions
var validExtensions = {
	/* Uncomment the following if you run PHP on your server and need
	 * to be able to pass commands to it.
	 */

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
	/* 
	 * A complete list of mimetypes is available at:
	 * http://www.iana.org/assignments/media-types/media-types.xhtml
	 */
};

/* Files that don't have extensions.
 *
 * To permit files that don't have any file extensions to be processed,
 * change permitUnknownFiles to 1. Note that this may not be safe!
 */
var permitUnknownFiles = 0;
var unknownFileType = "text/html";

/* API calls
 * To enable interactive features, set enableAPI to 1, and add your program's
 * interactive components to the function processAPI().
 */
var enableAPI = 0;
function processAPI(req, res) {
	timeStamp = getTimeStamp();
	console.log(timeStamp + ": PLACEHOLDER: Please customize processAPI()." + 
		"Requested URL was " + req.url);
	res.end("PLACEHOLDER: Please customize processAPI()." + 
		"Requested URL was " + req.url);
}

/* Directory listing
 * To enable directory listing, set permitDirectoryListing to 1. Note that
 * this may not be safe!
 */
var permitDirectoryListing = 0;

/* END USER CONFIGURATION
 *
 * If you really need to make more customizations, feel free to do so.
 */

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// 4. Build server
var customServer = {
	url : '',

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

	getFile : function(filename, res, mimeType) {
		fs.readFile(filename, function(err, contents) {
			if(err) {
				customServer.error("500B");
			} else {
				res.setHeader("Content-Length", contents.length);
				res.setHeader("Content-Type", validExtensions[mimeType]);
				res.statusCode = 200;
				res.write(contents);
				res.end();
			}
		});
	},

	getDir : function() {
		fs.readdir(customServer.url, function (err, files) {
			if (err) {
				throw err;
			} else {
				res.setHeader("Content-Type", "text/html");
				res.write('<!doctype html><html><head><title>Index of ' + req.url + '</title></head><body bgcolor="white"><h1>Index of ' + req.url + '</h1><hr><pre>Path/Filename<br/>-------------<br/><a href="../">../</a><br/>');
				var filesSorted = [];
				var dirsSorted = [];

				files.forEach(function(file) {
					var fileObj = customServer.url + file;
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
	},

	error : function(type, res) {
		switch(type) {
			case "403": res.writeHead(403); res.end(error403); break;
			case "404": res.writeHead(404); res.end(error404); break;
			case "500A" : res.writeHead(500); res.end(error500A); break;
			default : res.writeHead(500); res.end(error500B);
		}
	},

	init : function(req, res) {
		console.log(customServer.timeStamp() + ": Web server starting on " + serverUrl + ":" + port);
		http.createServer( function(req, res) {
			console.log(customServer.timeStamp() + ": New client request: " + req.url + " - Method: " + req.method);
			if(req.url=="/") {
				// Top-level request. Set URL to default.
				customServer.url = appDir + defaultHTML;
			} else {
				// Requested a specific file, location, or API.
				customServer.url = appDir + req.url;
			}
			if(path.extname(customServer.url)) {
				// A specific file was requested. Get the extension.
				console.log(customServer.timeStamp() + ": Client requested a file. Testing extension validity...");
				var ext = path.extname(customServer.url);
				var isValidExt = validExtensions[ext];
				if (isValidExt) {
					console.log(customServer.timeStamp() + ": File extension " + ext + " is VALID. Testing availability...");
					// The extension is valid. Serve the file up if it's available..
					fs.stat(customServer.url, function(err, stat){
						if(err === null) {
							console.log(customServer.timeStamp() + ": File is AVAILABLE. Providing to client.");
							customServer.fileCount += 1;
							customServer.getFile(customServer.url, res, ext); 
						} else {
							console.log(customServer.timeStamp() + ": File is UNAVAILABLE. Returning 404.");
							customServer.error("404", res);
						}
					});
				} else {
					console.log(customServer.timeStamp() + ": File extension '" + ext + "' is INVALID. Returning 500.");
					customServer.error("500A", res);
				}
			} else {
				console.log(customServer.timeStamp() + ": Client requested a location or API.");
				fs.stat(customServer.url, function(err, stat){
					if(err === null) {
						// This path exists. It is either a directory listing request or a file without an extension.
						if(!stat.isDirectory) {
							// The path is a file. Check if unknown file types are permitted.
							if(permitUnknownFiles == 1) {
								console.log(customServer.timeStamp() + ": Location identified as unknown file type. Processing as " + 
									unknownFileType + ".");
								this.getFile(customServer.url, res, unknownFileType);
							} else {
								console.log(customServer.timeStamp() + ": Location identified as unknown file type. Returning 500.")
								customServer.error("500A", res);
							}
						} else {
							// The path is a directory. Check if directory listing is allowed
							if(permitDirectoryListing == 1) {
								console.log(customServer.timeStamp() + ": Location identified as directory. Displaying contents.");
								this.getDir();
							} else {
								console.log(customServer.timeStamp() + ": Location identified as directory. Directory listing DENIED.");
								customServer.error("403", res);
							}
						}
					} else {
						// This path does not exist. It may be an API request.
						if(enableAPI == 1) {
							processAPI(req, res);
						} else {
							console.log(customServer.timeStamp() + ": Location requested does not exist. Returning 404.");
							customServer.error("404", res);
						}

					}
				});
			}
		}).listen(port, serverUrl);
	}
}

customServer.init();