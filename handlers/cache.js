var cacheSize = 10;
var cache = [];

module.exports = {
	setCacheSize: function(size)
	{
		cacheSize = size;
	},

	defaultCacheSize: function()
	{
		cacheSize = 10;
	},

	clearCache: function()
	{
		// Reset cache to a empty array
		cache = [];
	},

	getFullCache: function()
	{
		return cache;
	},

	setData: function(pluginName, data)
	{
		// First, remove the old data
		removeData(pluginName);

		toPush = new Array();

		toPush[0] = pluginName;
		toPush[1] = data;

		cache.push(toPush);
	},

	getData: function(pluginName)
	{
		for (i = 0; i < cache.length; i++)
		{
			if (cache[i][0] == pluginName)
			{
				if (typeof cache[i][1] != undefined)
				{
					return cache[i][1];
				}
			}
		}

		return null;
	}
};

function removeData(pluginName)
{
	for (i = 0; i < cache.length; i++)
	{
		if (cache[i][0] == pluginName)
		{
			cache.splice(i, 1);
		}
	}
}
