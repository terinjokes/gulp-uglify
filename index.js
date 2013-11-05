var es = require('event-stream'),
		uglify = require('uglify-js');

module.exports = function(opt) {
	'use strict';

	opt = opt || {};
	opt.fromString = true;

	return es.map(function (file, callback) {
		file.contents = new Buffer(uglify.minify(String(file.contents), opt).code);
		callback(null, file);
	});
};
