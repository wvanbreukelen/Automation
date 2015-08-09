var sys = require('sys');
var exec = require('child_process').exec;
var child;

module.exports = {
	// Run a console command
	run: function (command, puts)
	{
		try
		{
			child = exec(command, function (error, stdout, stderr)
			{
				if (error != null)
				{
					if (stderr.length > 0)
					{
						console.log("[ERROR] Command error: " + stderr);
					}
					return null;
				}

				return stdout;
			});

			child();
		} catch (ex) {
			console.log("[ERROR] Cannot run command, error: " . ex);
			return null;
		}
	}
}
