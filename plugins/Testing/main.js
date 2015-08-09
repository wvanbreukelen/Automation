var cmd = require('../../command.js');

module.exports = {
	uri: 'test',

	run: function ()
	{
		return "This is just a simple test ;)";
	},

	startDeamon: function()
	{
		console.log("Starting testing deamon....");
	},

	stopDeamon: function()
	{
		console.log("Stopping testing deamon....");
	}
}
