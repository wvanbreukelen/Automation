// Application configuration
var ip = '192.168.178.43';
var port = 1337;
var plugins = ['PIRSensor'];

// Basic requirements
var http = require('http');
var url = require('url');
var sys = require('sys');
var fs = require('fs');
var exec = require('child_process').exec;
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
registerDeamons();

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
			writeConsole('Written response');
		}
	}
}).listen(port, ip);

writeConsole('Listening for new requests at ' + ip + ' on port ' + port, 'SUCCESS');

// FUNCTIONS UNDER HERE, PLEASE DO NOT POST PRODUCAL CODE UNDER HERE

// Register a new device to the application
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

// Write a message to the socket
function writeConsole(message, level)
{
	level = typeof level !== 'undefined' ? level : 'info';
	console.log("[" + level.toUpperCase() + "] " + message);
}

// Write a new http response
function writeResponse(response, text)
{
	response.writeHead(200, {'Content-Type': 'text-plain'});
	response.write(text);
	response.end();
}

function httpRedirect(response, location)
{
	response.writeHead(302, {
  		'Location': "http://" + location
	});
	response.write("Redirection takes place...");
	response.end();
}

// Write to filesystem
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

// Resolve a specfic action
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

// Match a request do a desired action
function httpMatchAction(uri, response, request)
{
	for (i = 0; i < actions.length; i++)
	{
		actionId = actions[i][0];
		actionUri = actions[i][1];
		actionFunction = actions[i][2];

		writeConsole('Current: ' + uri + ' defined: ' + actionUri);

		if (actionUri == uri)
		{
			writeConsole('Found match for ' + uri + " uri");
			return actions[i];
		}
	}

	return null;
}

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

// Add a action to the application
function addAction(id, uri, action)
{
	actions.push([id, uri, action]);
}

// Add a new deamon handler to the application
function addDeamon(id, deamon)
{
	deamons.push([id, deamon]);
}

// Register all of the plugins that are listed in the configuration of the application
function registerPlugins()
{
	for (i = 0; i < plugins.length; i++)
	{
		registerPlugin(plugins[i]);
	}
}

// Register a new plugin
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

	// Write action and deamon to array
	addAction(name, 'test', action);
	addDeamon(name, deamon);

	writeConsole("Succesfully registered " + name + " plugin as an action!", 'SUCCESS');
	writeConsole(actions[0]);
}

function registerDeamons()
{
	for (i = 0; i < deamons.length; i++)
	{
		deamonId = actions[i][0];
		deamonFunction = actions[i][2];

		console.log(deamonFunction);

		deamon = deamonFunction();

		writeConsole("Starting " + deamonId + " deamon or deamons");
		deamon.startDeamon();
	}
}

// Strip the trailing slash at the beginning of a basepath, so we can extract a URI
function stripTrailingSlash(basepath)
{
    if (basepath.substr(0, 1) === '/')
	{
        return basepath.substr(1);
    }

    return basepath;
}

// Cleanup some JSON payload
function cleanupJson(payload)
{
	return JSON.stringify(json, null, 4);
}
