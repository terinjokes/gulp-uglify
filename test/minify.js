'use strict';
var test = require('tape'),
		Vinyl = require('vinyl'),
		gulpUglify = require('../'),
		sourcemaps = require('gulp-sourcemaps'),
		uglifyjs = require('uglify-js');

var testContentsInput = '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';
var testContentsExpected = uglifyjs.minify(testContentsInput, {fromString: true}).code;

var testFile1 = new Vinyl({
	cwd: "/home/terin/broken-promises/",
	base: "/home/terin/broken-promises/test",
	path: "/home/terin/broken-promises/test/test1.js",
	contents: new Buffer(testContentsInput)
});

test('should minify files', function(t) {
	t.plan(7);

	var stream = gulpUglify();

	stream.on('data', function(newFile) {
		t.ok(newFile, 'emits a file');
		t.ok(newFile.path, 'file has a path');
		t.ok(newFile.relative, 'file has relative path information');
		t.ok(newFile.contents, 'file has contents');

		t.ok(newFile instanceof Vinyl, 'file is Vinyl');
		t.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

		t.equals(String(newFile.contents), testContentsExpected);
	});

	stream.write(testFile1);
	stream.end();
});

test('should have a proper sources array', function(t) {
	t.plan(8);

	var filename = testFile1.path.substr(testFile1.path.lastIndexOf('/') + 1);

	var map = uglifyjs.minify(testContentsInput, {fromString: true, outSourceMap: filename}).map;
	t.equal(typeof map, 'string', 'has a map');

	var json = JSON.parse(map);
	t.ok(json, 'is valid JSON');
	t.ok(Array.isArray(json.sources), 'map has sources array');
	t.deepEquals(json.sources, [ '?' ], 'sources array contains invalid input');

	var sm = sourcemaps.init();
	var stream = sm.pipe(gulpUglify());

	stream.on('data', function(newFile) {
		t.ok(newFile, 'emits a file');
		t.ok(newFile.sourceMap, 'has a source map');
		t.ok(Array.isArray(newFile.sourceMap.sources), 'source map has sources array');
		t.deepEquals(newFile.sourceMap.sources, [filename], 'sources array has the input');
	});

	sm.write(testFile1);
	sm.end();
});
