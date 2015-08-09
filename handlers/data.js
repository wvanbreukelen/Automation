var cache = require('./cache.js');

module.exports = {
	resolve: function(uri)
	{
		res = uri.split("/");

		// Check if a plugin name has been passed
		if (typeof res[1] == undefined)
		{
			return false;
		}

		// Check if some data has been passed
		if (typeof res[2] == undefined)
		{
			return false;
		}

		// We are all set, let's resolve some data

		pluginName = res[1];
		data = res[2];

		cache.setData(pluginName, data);

		return pluginName;
	},

	get: function(pluginName)
	{
		return cache.getData(pluginName);
	}
}
