'use strict';
var through = require('through2'),
	uglify = require('uglify-js'),
	merge = require('deepmerge'),
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
			originalSourceMap;

		if (file.sourceMap) {
			options.outSourceMap = file.relative;
			options.inSourceMap = file.sourceMap;
			originalSourceMap = file.sourceMap;
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
		} catch (e) {
			if(options.swallowErrors === false) {
				return callback(uglifyError({
					message:e.message,
					fileName: file.path,
					lineNumber: e.line
				}));
			} else {
				console.warn('Error caught from uglify: ' + e.message + ' in ' + file.path + '. Returning unminifed code');
				this.push(file);
				return callback();
			}
		}

		if (file.sourceMap) {
			file.sourceMap = JSON.parse(mangled.map);
			file.sourceMap.sourcesContent = originalSourceMap.sourcesContent;
			file.sourceMap.sources = originalSourceMap.sources;
		}

		this.push(file);

		callback();
	}

	return through.obj(minify);
};
