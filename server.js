// Application configuration
var ip = '192.168.178.43';
var port = 1337;
var plugins = ['PIRSensor', 'Testing'];

// Basic requirements
var http = require('http');
var url = require('url');
var sys = require('sys');
var fs = require('fs');
var cmd = require('./command.js');
var nativefs = require('./filesystem.js').filesystem;

// Holds all application (plugin) actions
var actions = [];

// Holds all application deamons
var deamons = [];

// Start a new AutomationNode HTTP API server
var request, response;

writeConsole('Starting AutomationNode...');
writeConsole('Loading all plugins listed in the application configuration...');

// Register all of the plugins and their deamons
registerPlugins();

writeConsole('Starting plugins deamons...');
startDeamons();

writeConsole('Succesfully loaded plugins!', 'SUCCESS');
writeConsole('Starting build-in HTTP server...');

var server = http.createServer(function(request, response)
{
	var uri = stripTrailingSlash(url.parse(request.url).pathname);

	// Do not espect a response from a favicon.ico request
	if (uri != "favicon.ico")
	{
		writeConsole('New incoming request...');
		writeConsole('Calling with: ' + uri);

		if (uri == "kill")
		{
			killServer(response);
			// Code under here will not been executed
		}

		// Match the given uri with the corrent plugin action
		var plugin = httpMatchAction(uri, response, request);

		// Load that plugin
		var instance = loadPlugin(plugin);
		var output;

		// Check if the given result is a actual callable object
		if (instance == null)
		{
			// Redirect the user to the given device ip address
			// assuming that they are running a webserver on the default port is set to 80
			writeConsole('Redirecting user to default location');
			httpRedirect(response, ip);
		} else {
			output = instance.run();

			writeConsole('Writing response...');
			writeResponse(response, output);
			writeConsole('Written response', 'SUCCESS');
		}

		writeConsole('Closed communication with client');
	}
}).listen(port, ip);

writeConsole('Listening for new requests at ' + ip + ' on port ' + port, 'SUCCESS');

// FUNCTIONS UNDER HERE, PLEASE DO NOT POST PRODUCAL CODE UNDER HERE

/**
 * Register a new device to the application
 * @wvanbreukelen is this function needed anymore???
 * @param  {string} deviceId   The devide ID
 * @param  {string} deviceName The device name
 * @param  {string} onCode     The code to turn the device on
 * @param  {string} offCode    The code to turn the device off
 * @return {mixed}
 */
function registerDevice(deviceId, deviceName, onCode, offCode)
{
	var payload = {
		"deviceID": deviceId,
		"deviceName": deviceName,
		"onCode": onCode,
		"offCode": offCode
	};

	writeFs('devices.json', cleanupJson(payload));
}

/**
 * Write a message to the console window
 * @param  {string} message The message to show
 * @param  {string} level   The log level
 * @return {mixed}
 */
function writeConsole(message, level)
{
	level = typeof level !== 'undefined' ? level : 'info';
	console.log("[" + level.toUpperCase() + "] " + message);
}

/**
 * Write a new HTTP response
 * @param  {object} response The response object
 * @param  {string} text     The text that the response has to contain
 * @return {mixed}
 */
function writeResponse(response, text)
{
	response.writeHead(200, {'Content-Type': 'text-plain'});
	response.write(text);
	response.end();
}

/**
 * Redirect the client to another page
 * @param  {object} response The response object
 * @param  {string} location The new location to redirect to
 * @return {mixed}
 */
function httpRedirect(response, location)
{
	response.writeHead(302, {
  		'Location': "http://" + location
	});
	response.write("Redirection takes place...");
	response.end();
}

/**
 * Write something to the filesystem
 * @wvanbreukelen Can been replaced with the native filesystem
 * @param  {string} filename The new filename
 * @param  {string} input    The input to write
 * @return {bool}            Successfull or not
 */
function writeFs(filename, input)
{
	return fs.writeFile(filename, input, function (error)
	{
		if (error)
		{
			return error;
		} else {
			return true;
		}
	});
}

/**
 * Resolve a specfic action
 * @param  {mixed} action The action to resolved
 * @return {mixed}        The resolved action or a null response when failed
 */
function resolveAction(action)
{
	consoleWrite('Resolving action...');

	try
	{
		var resolved = action();
		writeConsole('Successfully resolved action!', 'SUCCESS');

		return resolved;
	} catch (ex) {
		writeConsole('Failed to resolve action, see thrown exception', 'ERROR');
		writeConsole(ex.getMessage());

		return null;
	}
}

/**
 *  Match a request do a desired action
 * @param  {string} uri      The current request URI
 * @param  {object} response The response object
 * @param  {object} request  The response object
 * @return {mixed}           The results
 */
function httpMatchAction(uri, response, request)
{
	for (i = 0; i < actions.length; i++)
	{
		actionId = actions[i][0];
		actionUri = actions[i][1];
		actionFunction = actions[i][2];

		if (actionUri == uri)
		{
			writeConsole('Found match for ' + uri + " uri");
			return actions[i];
		}
	}

	return null;
}

/**
 * Load a specfic plugin
 * @param  {mixed} plugin The plugin itself
 * @return {mixed}       The output
 */
function loadPlugin(plugin)
{
	writeConsole('Starting plugin loading...');

	try
	{
		if (typeof plugin != 'undefined' || plugin == null)
		{
			var output = plugin[2]();
			writeConsole('Successfully loaded plugin', 'SUCCESS');
		} else {
			writeConsole('Plugin seems not to been loaded!', 'WARNING');
		}

		return output;
	} catch (ex) {
		// Assuming that the developer understand that no given plugin returns a response, pass no error.
		return null;
	}
}

/**
 * Add a action to the application
 * @param {string} id     Action ID
 * @param {string} uri    The URI that the action will respond to
 * @param {mixed} action  The action itself
 */
function addAction(id, uri, action)
{
	actions.push([id, uri, action]);
}

/**
 * Add a new deamon handler to the application
 * @param {string} id     The deamon id
 * @param {mixed} deamon The deamon itself
 */
function addDeamon(id, deamon)
{
	deamons.push([id, deamon]);
}

/**
 * Register all of the plugins that are listed in the configuration of the application
 * @return {mixed}
 */
function registerPlugins()
{
	for (i = 0; i < plugins.length; i++)
	{
		registerPlugin(plugins[i]);
	}
}

/**
 * Register a new plugin
 * @param  {string} name The plugin name
 * @return {mixed}
 */
function registerPlugin(name)
{
	writeConsole("Registering " + name + " plugin...");
	writeConsole("Resolving plugins paths for " + name + " plugin...");

	var pluginPath = nativefs.currentPath() + "plugins/" + name;
	var actionPath = pluginPath + "/main.js";

	if (nativefs.directoryExists(pluginPath))
	{
		writeConsole("Plugin " + name + " does exists and is located in the following folder: " + pluginPath, 'SUCCESS');
	} else {
		writeConsole("[ERROR] Plugin " + name + " does NOT exists, folder: " + pluginPath, 'ERROR');
	}

	// @wvanbreukelen TODO Make a file existance check of the actionPath!

	var action = function()
	{
		writeConsole("Loading plugin action for " + actionPath);
		return require(actionPath);
	};

	var deamon = function()
	{
		writeConsole("Registering deamons for " + actionPath);
		return require(actionPath);
	}

	// Resolve the plugin URI that the plugin responds to
	responduri = resolvePluginRespondURI(action());

	if (responduri == null)
	{
		writeConsole("Cannot find respond URI for plugin " + name + "!", 'WARNING');
		// Return a random number that acts as a URI so the plugin is still callable but in a super uneasy way
		responduri = Math.floor((Math.random() * 1000) + 1);
		writeConsole("Please call the " + name + " plugin with the following URL: " + resolveServerHttpLink() + responduri);
	}

	// Write action and deamon to array
	addAction(name, responduri, action);
	addDeamon(name, deamon);

	writeConsole("Succesfully registered " + name + " plugin as an action!", 'SUCCESS');
	//writeConsole(actions[0]);
}

/**
 * Resolves the URI that the plugin responds to
 * @param  {object} plugin The plugin object
 * @return {mixed}        The results;
 */
function resolvePluginRespondURI(plugin)
{
	uri = plugin.uri;

	if (typeof uri != 'undefined')
	{
		return uri;
	} else {
		return null;
	}
}

function resolveServerHttpLink()
{
	return "http://" + ip + ":" + port + "/";
}

/**
 * Start all of the registered deamons
 * @return {mixed}
 */
function startDeamons()
{
	for (i = 0; i < deamons.length; i++)
	{
		deamonId = actions[i][0];
		deamonFunction = actions[i][2];

		console.log(deamonFunction);

		deamon = deamonFunction();

		writeConsole("Starting " + deamonId + " deamon or deamons");
		deamon.startDeamon();
		writeConsole("Started " + deamonId + " deamon!", "SUCCESS");
	}
}

/**
 * Stop all of the registered deamons
 */
function stopDeamons()
{
	for (i = 0; i < deamons.length; i++)
	{
		deamonKillFunction = actions[i][2];

		deamon = deamonKillFunction();

		writeConsole("Stopping " + deamonId + " deamon...");
		deamon.stopDeamon();
		writeConsole("Stopped deamon!", "SUCCESS");
	}
}

/**
 * Strip the trailing slash at the beginning of a basepath, so we can extract a URI
 * @param  {string} basepath The basepath to Strip
 * @return {string}          The stripped basepath, the URI
 */
function stripTrailingSlash(basepath)
{
    if (basepath.substr(0, 1) === '/')
	{
        return basepath.substr(1);
    }

    return basepath;
}

/**
 * Cleanup some JSON payload for better readability
 * @param {string} The JSON payload to cleanup
 * @return {string} The cleanup JSON payload
 */
function cleanupJson(payload)
{
	return JSON.stringify(json, null, 4);
}

/**
 * Kill the server
 */
function killServer(response)
{
	writeConsole("Killing server...");
	stopDeamons();
	writeConsole("Killed plugin deamons!", "SUCCESS");
	writeConsole("Writing final response...");

	writeResponse(response, "Killed server on port " + port + "!");
	writeConsole("Written response", 'SUCCESS');
	writeConsole("Stopping main server...");
	server.close();
	writeConsole('Stopped main server', 'SUCCESS');
	writeConsole('Stopping node.js execution, goodbye ;)');

	cmd.run('sudo pkill -f node');
	console.log('Done');
}
