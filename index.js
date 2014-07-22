'use strict';
var through = require('through2'),
	uglify = require('uglify-js'),
	merge = require('deepmerge'),
	uglifyError = require('./lib/error.js'),
	reSourceMapComment = /\n\/\/# sourceMappingURL=.+?$/;

module.exports = function(opt) {

	function minify(file, encoding, callback) {
		/*jshint validthis:true */

		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		if (file.isStream()) {
			return callback(uglifyError('Streaming not supported', {
				fileName: file.path,
				showStack: false
			}));
		}

		var options = merge(opt || {}, {
			fromString: true,
			output: {}
		});

		var mangled,
			originalSourceMap;

		if (file.sourceMap) {
			options.outSourceMap = file.relative;
			if (file.sourceMap.mappings !== '') {
				options.inSourceMap = file.sourceMap;
			}
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
			file.contents = new Buffer(mangled.code.replace(reSourceMapComment, ''));
		} catch (e) {
			console.warn('Uglify Error: ' + e.message + ' \n in ' + file.path + (e.line && e.col ? ':' + e.line + ':' + e.col : ''));
			showErrorInFile(e, file);

			return callback(uglifyError(e.message, {
				fileName: file.path,
				lineNumber: e.line,
				stack: e.stack,
				showStack: false
			}));
		}

		if (file.sourceMap) {
			file.sourceMap = JSON.parse(mangled.map);
			file.sourceMap.sourcesContent = originalSourceMap.sourcesContent;
			file.sourceMap.sources = originalSourceMap.sources;
		}

		this.push(file);

		callback();
	}

	var lineOffsetSize = 10,
		tabs = /\t/g,
		SPACE = ' ';

	// Outputs a snippet with the current error line and the line above it to spot the bug easily
	function showErrorInFile(error, file) {
		var line = error.line,
			lineStr, lines;

		if (line && error.col) {
			lines = String(file.contents).split('\n');

			if (line > 1) {
				console.log(lines[error.line - 2].replace(tabs, SPACE));
			}

			lineStr = lines[error.line - 1];

			if (lineStr) {
				lineStr = lineStr.substr(Math.max(error.col - lineOffsetSize, 0), lineOffsetSize * 2);
				console.log(lineStr.replace(tabs, SPACE));
				console.log(Array(lineOffsetSize - 1 + error.col).join(SPACE) + '^');
			}
		}
	}


	return through.obj(minify);
};