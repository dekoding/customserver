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
### Startup
To start CustomServer, use `node customserver.js`. It assumes there is a subdirectory called `/app` and a file there called `index.html`. These are easily customized in the script itself. (See below).

CustomServer starts the http process on `127.0.0.1:1337` by default. Anything you put in `/app`, such as HTML, CSS, and JavaScript, will be served up appropriately.

### Default options and customization
The built-in customization options for CustomServer are detailed below:

<table>
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Default value</th>
                        <th>Explanation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>SERVER_ADDRESSES</td>
                        <td>[ "127.0.0.1" ]</td>
                        <td><p>This is an array of addresses. CustomServer will start a listener on each address specified.</p>
                            <p>Example:</p>
<pre>
var SERVER_ADDRESSES = [ "192.168.1.1", "10.0.0.1" ];
</pre>
                        </td>
                    </tr>
                    <tr>
                        <td>SERVER_PORTS</td>
                        <td>[ 1337 ]</td>
                        <td><p>This is an array of ports. CustomServer will use each port you specify.</p>
                            <p>Example:</p>
<pre>
var SERVER_PORTS = [ 8080, 1234, 80 ];
</pre>
                        </td>
                    </tr>
                    <tr>
                        <td>USE_SSL</td>
                        <td>0</td>
                        <td><p>A value of 0 tells CustomServer to use HTTP.</p>
                            <p>A value of 1 tells CustomServer to use HTTPS.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>KEY</td>
                        <td>'/path/to/key'</td>
                        <td><p>The path to the server's SSL key (only used if USE_SSL is set to 1)</p>
                        </td>
                    </tr>
                    <tr>
                        <td>CERT</td>
                        <td>'/path/to/cert'</td>
                        <td><p>The path to the server's SSL certificate (only used if USE_SSL is set to 1)</p>
                        </td>
                    </tr>
                    <tr>
                        <td>SSL_PORTS</td>
                        <td>[ 443 ]</td>
                        <td><p>This is an array of ports. CustomServer will use these ports if SSL is enabled.</p>
                            <p>Example:</p>
<pre>
var SSL_PORTS = [ 443, 567 ];
</pre>
                        </td>
                    </tr>
                    <tr>
                        <td>APP_DIR</td>
                        <td>'./app'</td>
                        <td><p>The path to the server's root directory</p>
                        </td>
                    </tr>
                    <tr>
                        <td>DEFAULT_HTML</td>
                        <td>'index.html'</td>
                        <td><p>The default file to load if none is specified in the client request</p>
                        </td>
                    </tr>
                    <tr>
                        <td>USE_CUSTOM_ERROR_FILES</td>
                        <td>0</td>
                        <td><p>CustomServer provides default error messages, but if you want to use your own (for instance, a custom 404), set this to 1 and create your own error pages.</p>
                            <p>Custom error files are in the format &lt;error&gt;.html. For example, <strong>404.html</strong>.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>CUSTOM_ERROR_DIR</td>
                        <td>'./app'</td>
                        <td><p>If you are using custom error pages, this is the directory they are pulled from. Usually, it's safe to keep this the same as the root ('./app') directory.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>ERROR_*</td>
                        <td>(varies)</td>
                        <td><p>Default text to display on an error page.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>EXTENSIONS</td>
                        <td>
<pre>
{
    ".html" : "text/html",          
    ".js": "application/javascript",
    ".json": "application/json", 
    ".css": "text/css",
    ".txt": "text/plain",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".png": "image/png",
    ".ico": "image/ico"
}
</pre>
                        </td>
                        <td><p>This associative array lists the extensions and associated mimetypes CustomServer can process by default. It can be added to as needed.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>ALLOW_UNKNOWN_FILETYPES</td>
                        <td>0</td>
                        <td><p>A value of 0 tells CustomServer to reject attempts to access files with unrecognized extensions, even if they are present on the server.</p>
                            <p>A value of 1 tells CustomServer to allow access to files with unrecognized extensions. CustomServer will attempt to recognize the file's mimetype automatically.</p>
                            <p>NOTE: Mimetype detection is only supported on Linux at this time.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>ALLOW_DIR_LISTING</td>
                        <td>0</td>
                        <td><p>A value of 0 tells CustomServer to reject attempts to view directories.</p>
                            <p>A value of 1 tells CustomServer to allow directory listing.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>ENABLE_API</td>
                        <td>0</td>
                        <td><p>This is the heart of CustomServer. All other options are for displaying static content. But most web apps need to be able to respond to things like POST requests and attempts to retrieve data in ways that involve instructing the server to perform certain tasks, rather than just displaying a file.</p>
                            <p>if ENABLE_API is set to 1, CustomServer will pass all POSTs, and any GETs that request something other than a file or directory that is present on the server, to a function called <em>processAPI()</em>. It is this function's job to determine what needs to be done with the POST or GET it receives.</p>
                            <p>By default, <em>processAPI()</em> only contains placeholders. It is up to the web developer to populate the function with appropriate mechanisms for responding to the POST and GET requests.</p>
                        </td>
                    </tr>
                </tbody>
            </table>

CustomServer is released under the Apache 2.0 license, a very permissive license that allows you to use and customize it for nearly anything you can imagine. Please abide by its (very, very few) restrictions.

# TODO
* Create a barebones NPM package for easy downloading
* Add support for testing scripts (such as karma or jasmine)
* Add a login system

CustomServer is released under the Apache 2.0 license, a very permissive license that allows you to use and customize it for nearly anything you can imagine. Please abide by its (very, very few) restrictions.


