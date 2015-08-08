// Here comes the PIRSensor action and config shit

// Caution, sensor.py file is hard-coded right now, will likely not work in other system cercstances.

var cmd = require('../../command.js');

module.exports = {
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

		console.log("[SUCCESS] Successfully stopped PIR sensor deamon");
	},

	stopDeamon: function()
	{
		console.log("Stopping PIR sensor deamon...");

		//cmd.run()

		console.log("[SUCCESS] Stopped PIR sensor deamon")
	}
}
