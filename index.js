'use strict';
var through = require('through2'),
	uglify = require('uglify-js'),
	extend = require('xtend'),
	Vinyl = require('vinyl');

module.exports = function(opt) {

	function minify(file, encoding, callback) {
		/*jshint validthis:true */
		var options = extend({}, opt, {
			fromString: true
		});

		var mangled,
			map;

		if (options.outSourceMap === true) {
			options.outSourceMap = file.relative + '.map';
		}

		try {
			mangled = uglify.minify(String(file.contents), options);
			file.contents = new Buffer(mangled.code);
			this.push(file);
		} catch (e) {
			console.warn('Error caught from uglify: ' + e.message + ' in ' + file.path + '. Returning unminifed code');
			this.push(file);
			return callback();
		}

		if (options.outSourceMap) {
			map = new Vinyl({
				cwd: file.cwd,
				base: file.base,
				path: file.path + '.map',
				contents: new Buffer(mangled.map)
			});
			this.push(map);
		}

		callback();
	}

	return through.obj(minify);
};
