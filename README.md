# customserver.js
An easily customized and well-commented web server using node.js with no external requirements.

# MANIFESTO
The goal here is to include the minimum set of built-in modules to handle everything a regular web server needs to be able to handle. A web server should:
* Allow access to standard file types (HTML, images, etc.)
* Elegantly handle bad URLs
* Accept GET and POST requests (For interactive apps)

The end result should be a server that is usable for static pages immediately, and is quick and easy to customize for interactive pages with a minimum of fuss.

This is NOT a server that needs an extensive set of add-on modules to be fully functional. It is ideal for the frontend developer who wants to just start writing HTML and JavaScript immediately and have it work.

To develop interactive apps that send, receive, and store data in a database or file on the node.js host, you will of course need whatever modules are required for that project.

# USAGE
Literally, just "node customserver.js" and that's it. It assumes there is a subdirectory called /app and a file there called index.html. These are easily customized in the script itself, which is well-commented for adjustment as you see fit.

It will start the http process on http://127.0.0.1:1337 by default. Anything you put in /app, be it CSS, JavaScript, or HTML, will be served up appropriately. The server also supports file browsing, though this isn't on by default.

Since the goal is to get a developer who wants to work on the frontend immediately get started, NO other node.js modules are required. The point of customserver is to be able to run it and forget about it while you're working on the user-viewable part of your website.

That said, it has been designed with the idea of shunting all requests for changeable content (API calls and POSTs) into a function that can be customized to respond however you like. If that option is enabled and a client requests either a URL that isn't present on the server (something like 127.0.0.1:1337/?getJSONData, for example) or requests to POST something somewhere, the handling for that is passed off to the function processAPI(req, res). Within that function, you can place all of your interactivity.

# TODO
* Add support for SSL
* Add other customization options, such as static error pages
* Create a barebones NPM package for easy downloading
* Add support for testing scripts (such as karma or jasmine)

CustomServer is released under the Apache 2.0 license, a very permissive license that allows you to use and customize it for nearly anything you can imagine. Please abide by its (very, very few) restrictions.


