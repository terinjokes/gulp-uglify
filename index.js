'use strict';
var through = require('through2'),
	uglify = require('uglify-js'),
	merge = require('deepmerge'),
	Vinyl = require('vinyl'),
	cache = require('memory-cache'),
	uglifyError = require('./lib/error.js');

module.exports = function(opt) {

	function objectIsEqual(a, b) {
		return JSON.stringify(a) === JSON.stringify(b);
	}

	function minify(file, encoding, callback) {
		/*jshint validthis:true */

		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		if (file.isStream()) {
			return callback(uglifyError('Streaming not supported'));
		}

		var options = merge(opt || {}, {
			fromString: true,
			output: {}
		});

		var map,
			sourceMap;

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
			var rawContents = String(file.contents);
			var code,
					cached;
			if (options.cache &&
					(cached = cache.get(file.path)) &&
					cached.raw === rawContents &&
					objectIsEqual(cached.options, opt)) {

				// cache hit
				code = cached.mangled;
				sourceMap = cached.map;
			} else {
				var mangled = uglify.minify(rawContents, options);
				code = mangled.code;
				sourceMap = mangled.map;

				if (options.cache) {
					cache.put(file.path, {
						raw: rawContents,
						mangled: code,
						map: sourceMap,
						options: opt
					});
				}
			}

			file.contents = new Buffer(code);
			this.push(file);

		} catch (e) {
			console.warn('Error caught from uglify: ' + e.message + ' in ' + file.path + '. Returning unminifed code');
			this.push(file);
			return callback();
		}

		if (options.outSourceMap) {
			sourceMap = JSON.parse(sourceMap);
			sourceMap.sources = [ file.relative ];
			map = new Vinyl({
				cwd: file.cwd,
				base: file.base,
				path: file.path + '.map',
				contents: new Buffer(JSON.stringify(sourceMap))
			});
			this.push(map);
		}

		callback();
	}

	return through.obj(minify);
};
