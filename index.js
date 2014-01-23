'use strict';
var through = require('through2'),
	uglify = require('uglify-js'),
	extend = require('xtend');

module.exports = function(opt) {

	var options = extend({}, opt, {
		fromString: true
	});

	function minify(file, encoding, callback) {
		/*jshint validthis:true */
		var mangled;

		try {
			mangled = uglify.minify(String(file.contents), options);
			file.contents = new Buffer(mangled.code);
		} catch (e) {
			console.warn('Error caught from uglify: ' + e.message + ' in ' + file.path + '. Returning unminifed code');
		}

		this.push(file);
		callback();
	}
	return through.obj(minify);
};
