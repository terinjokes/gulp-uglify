'use strict';
var PluginError = require('gulp-util/lib/PluginError');

module.exports = function uglifyError (message, options) {
	return new PluginError('gulp-uglify', {
		message: message,
		stack: options.stack.replace(
			'Error\n',
			'Error: ' + message +
			'\n    in: ' + options.fileName +
			'\n    at line: ' + options.lineNumber +
			'\n'
		)
	}, options);
};
