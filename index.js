var es = require('event-stream'),
		uglify = require('uglify-js'),
		clone = require('clone');

module.exports = function() {
	'use strict';
	function minify(file, callback) {
		var newFile = clone(file);
		newFile.contents = new Buffer(uglify.minify(String(file.contents), {fromString: true}).code);

		callback(null, newFile);
	}

	return es.map(minify);
};
