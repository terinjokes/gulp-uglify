'use strict';
var test = require('tape'),
		Vinyl = require('vinyl'),
		gulpUglify = require('../'),
		uglifyjs = require('uglify-js'),
		concat = require('gulp-concat'),
		sourcemaps = require('gulp-sourcemaps'),
		path = require('path');

var testContents1Input = '(function (first, second) {\n    console.log(first + second);\n}(5, 10));\n//# sourceMappingURL=data:application/json;base64,' + new Buffer('{"version":3,"file":"test1.js","sourceRoot":"","sources":["test1.ts"],"sourcesContent":["(function(first, second) { console.log(first + second) }(5, 10))"],"names":[],"mappings":"AAAA,CAAC,UAAS,KAAK,EAAE,MAAM;IAAI,OAAO,CAAC,GAAG,CAAC,KAAK,GAAG,MAAM,CAAC;AAAC,CAAC,CAAC,CAAC,EAAE,EAAE,CAAC,CAAC"}').toString('base64');
var testContents1Expected = uglifyjs.minify(testContents1Input, {fromString: true}).code;
var testContents2Input = '(function (alert) {\n    alert(5);\n}(alert));\n//# sourceMappingURL=data:application/json;base64,' + new Buffer('{"version":3,"file":"test2.js","sourceRoot":"","sources":["test2.ts"],"sourcesContent":["(function(alert) { alert(5); }(alert))"],"names":[],"mappings":"AAAA,CAAC,UAAS,KAAK;IAAI,KAAK,CAAC,CAAC,CAAC;AAAE,CAAC,CAAC,KAAK,CAAC,CAAC"}').toString('base64');
var testContents2Expected = uglifyjs.minify(testContents1Expected + testContents2Input, {fromString: true}).code;

function getTestFile1() {
	return new Vinyl({
		cwd: "/home/terin/broken-promises/",
		base: "/home/terin/broken-promises/test",
		path: "/home/terin/broken-promises/test/test1.js",
		contents: new Buffer(testContents1Input)
	});
}

function getTestFile2() {
	return new Vinyl({
		cwd: "/home/terin/broken-promises/",
		base: "/home/terin/broken-promises/test",
		path: "/home/terin/broken-promises/test/test2.js",
		contents: new Buffer(testContents2Input)
	});
}

test('should minify files', function(t) {
	t.plan(6);

	var mangled = gulpUglify();

	mangled.on('data', function(newFile) {
		t.ok(newFile, 'emits a file');
		t.ok(newFile.path, 'file has a path');
		t.ok(newFile.relative, 'file has relative path information');
		t.ok(newFile.contents, 'file has contents');

		t.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

		t.equals(String(newFile.contents), testContents1Expected);
	});

	mangled.write(getTestFile1());
	mangled.end();
});

test('should use input sourcemaps', function(t) {
	t.plan(14);

	var sm = sourcemaps.init({ loadMaps: true });
	var mangled = sm.pipe(gulpUglify());

	mangled.on('data', function(newFile) {
		t.ok(newFile, 'emits a file');
		t.ok(newFile.sourceMap, 'has a source map');
		t.equals(newFile.sourceMap.version, 3, 'source map has expected version');
		t.ok(Array.isArray(newFile.sourceMap.sources), 'source map has sources array');
		t.deepEquals(newFile.sourceMap.sources, [path.basename(newFile.relative, ".js") + ".ts"], 'sources array has original source');
		t.ok(Array.isArray(newFile.sourceMap.names), 'source maps has names array');
		t.ok(newFile.sourceMap.mappings, 'source map has mappings');
	});

	sm.write(getTestFile1());
	sm.write(getTestFile2());
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

	sm.write(getTestFile1());
	sm.write(getTestFile2());
	sm.end();
});
