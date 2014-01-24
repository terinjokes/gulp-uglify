'use strict';
var through = require('through2'),
	uglify = require('uglify-js'),
	merge = require('deepmerge'),
	Vinyl = require('vinyl');

module.exports = function(opt) {

	function minify(file, encoding, callback) {
		/*jshint validthis:true */
		var options = merge(opt || {}, {
			fromString: true,
			output: {}
		});

		var mangled,
			map;

		if (options.outSourceMap === true) {
			options.outSourceMap = file.relative + '.map';
		}

		if (options.preserveComments === 'all') {
			options.output.comments = true;
		} else if (options.preserveComments === 'some') {
			// preserve comments with directives or that start with a bang (!)
			options.output.comments = /^!|@preserve|@license|@cc_on/i;
		} else if (typeof options.preserveComments === 'function') {
			options.output.comments = options.preserveComments;
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
