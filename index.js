var es = require('event-stream'),
		uglify = require('uglify-js');

module.exports = function(opt) {
	'use strict';

	opt = opt || {};
	opt.fromString = true;

	return es.map(function (file, callback) {
		try {
			file.contents = new Buffer(uglify.minify(String(file.contents), opt).code);
		} catch(e) {
			console.warn('Error caught from uglify: ' + e.message + '. Returning unminified code');
		}
		callback(null, file);
	});
};
