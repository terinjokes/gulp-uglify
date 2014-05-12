'use strict';
var through = require('through2'),
	uglify = require('uglify-js'),
	merge = require('deepmerge'),
	Vinyl = require('vinyl'),
	uglifyError = require('./lib/error.js');

module.exports = function(opt) {

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

		var mangled,
			map,
			sourceMap;

		if (options.inSourceMap === true) {
			var re = /\s*\/\/(?:@|#) sourceMappingURL=data:application\/json;base64,(\S*)$/m
			, srcMap = String(file.contents).match(re);

			if (!srcMap) {
				console.warn('No inline source map found in file, ignoring.');
				options.inSourceMap = null;
			} else {
				srcMap = new Buffer(srcMap[1], 'base64').toString('binary');
				options.inSourceMap = JSON.parse(srcMap);
			}
		}

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
			sourceMap = JSON.parse(mangled.map);
			sourceMap.file = file.relative;
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
