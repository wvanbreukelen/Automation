// Here comes the PIRSensor action and config shit

// Caution, sensor.py file is hard-coded right now, will likely not work in other system cercstances.

var app = require('../../autoload.js');

module.exports = {
	uri: 'pir',

	run: function ()
	{
		// Return the actual status of the PIRSensor.
		return app.data.get('pir');
	},

	startDeamon: function()
	{
		// Run the command to start the deamon
		app.cmd.run("sudo python /home/pi/node/AutomationNode/plugins/PIRSensor/sensor.py &");
	},

	stopDeamon: function()
	{
		app.cmd.run("sudo pkill -f AutomationNode/plugins");
	}
}
