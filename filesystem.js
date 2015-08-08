var fs = require('fs');

module.exports = {
	filesystem: {
		directoryExists: function directoryExists(path)
		{
			try {
				stats = fs.lstatSync(path);

				if (stats.isDirectory()) {
					return true;
				}
			}
			catch (e) {
				return false;
			}

			return false;
		},
		currentPath: function currentPath()
		{
			return __dirname + "/";
		},
		currentFile: function currentFile()
		{
			return __filename;
		}
	}
};
