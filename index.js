var es = require('event-stream'),
		uglify = require('uglify-js');

module.exports = (function() {
	'use strict';
	function minify(file, callback) {
		var newFile = {
			path: file.path,
			contents: uglify.minify(String(file.contents), {fromString: true}).code
		};

		callback(null, newFile);
	}

	return es.map(minify);
}());