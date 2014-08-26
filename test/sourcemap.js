'use strict';
var test = require('tape'),
		Vinyl = require('vinyl'),
		gulpUglify = require('../'),
		uglifyjs = require('uglify-js'),
		concat = require('gulp-concat'),
		sourcemaps = require('gulp-sourcemaps');

var testContents1Input = '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';
var testContents1Expected = uglifyjs.minify(testContents1Input, {fromString: true}).code;
var testContents2Input = '"use strict"; (function(alert) { alert(5); }(alert))';
var testContents2Expected = uglifyjs.minify(testContents1Expected + testContents2Input, {fromString: true}).code;

var testFile1 = new Vinyl({
	cwd: "/home/terin/broken-promises/",
	base: "/home/terin/broken-promises/test",
	path: "/home/terin/broken-promises/test/test1.js",
	contents: new Buffer(testContents1Input)
});

var testFile2 = new Vinyl({
	cwd: "/home/terin/broken-promises/",
	base: "/home/terin/broken-promises/test",
	path: "/home/terin/broken-promises/test/test2.js",
	contents: new Buffer(testContents2Input)
});

test('should minify files', function(t) {
	t.plan(11);

	var sm = sourcemaps.init();
	var mangled = sm.pipe(gulpUglify());

	mangled.on('data', function(newFile) {
		t.ok(newFile, 'emits a file');
		t.ok(newFile.path, 'file has a path');
		t.ok(newFile.relative, 'file has relative path information');
		t.ok(newFile.contents, 'file has contents');

		t.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

		t.equals(String(newFile.contents), testContents1Expected);

		t.ok(newFile.sourceMap, 'has a source map');
		t.equals(newFile.sourceMap.version, 3, 'source map has expected version');
		t.ok(Array.isArray(newFile.sourceMap.sources), 'source map has sources array');
		t.ok(Array.isArray(newFile.sourceMap.names), 'source maps has names array');
		t.ok(newFile.sourceMap.mappings, 'source map has mappings');
	});

	sm.write(testFile1);
	sm.end();
});

test('should merge source maps correctly', function(t) {
	t.plan(12);
	var sm = sourcemaps.init();
	var ct = sm.pipe(concat('all.js'));
	var mangled = ct.pipe(gulpUglify());

	mangled.on('data', function(newFile) {
		t.ok(newFile, 'emits a file');
		t.ok(newFile.path, 'file has a path');
		t.ok(newFile.relative, 'file has relative path information');
		t.ok(newFile.contents, 'file has contents');

		t.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

		t.equals(String(newFile.contents), testContents2Expected);

		t.ok(newFile.sourceMap, 'has a source map');
		t.equals(newFile.sourceMap.version, 3, 'source map has expected version');
		t.ok(Array.isArray(newFile.sourceMap.sources), 'source map has sources array');
		t.deepEquals(newFile.sourceMap.sources, ['test1.js', 'test2.js'], 'sources array has the inputs');
		t.ok(Array.isArray(newFile.sourceMap.names), 'source maps has names array');
		t.ok(newFile.sourceMap.mappings, 'source map has mappings');
	});

	sm.write(testFile1);
	sm.write(testFile2);
	sm.end();
});
