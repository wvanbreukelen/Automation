// Here comes the PIRSensor action and config shit

// Caution, sensor.py file is hard-coded right now, will likely not work in other system cercstances.

var cmd = require('../../command.js');

module.exports = {
	uri: 'pir',

	run: function ()
	{
		return "PIRSensor Plugin is here :)";
	},

	startDeamon: function()
	{
		// Start the sensor deamon
		console.log("Starting PIR sensor deamon...");

		// Run the command to start the deamon
		cmd.run("sudo python /home/pi/node/AutomationNode/plugins/PIRSensor/sensor.py &");

		console.log("[SUCCESS] Successfully started PIR sensor deamon!");
	},

	stopDeamon: function()
	{
		console.log("Stopping PIR sensor deamon...");
		// @wvanbreukelen Deamons will be killed automatically when running a specific request
		// or at of when the server is terminated.
		cmd.run("sudo pkill -f AutomationNode/plugins");

		console.log("[SUCCESS] Stopped PIR sensor deamon")
	}
}
