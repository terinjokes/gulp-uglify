'use strict';
var test = require('tape'),
		Vinyl = require('vinyl'),
		gulpUglify = require('../');
	
var testContentsInput = 'function errorFunction(error)\n{';
var testOkContentsInput = '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';

var testFile1 = new Vinyl({
	cwd: "/home/terin/broken-promises/",
	base: "/home/terin/broken-promises/test",
	path: "/home/terin/broken-promises/test/test1.js",
	contents: new Buffer(testContentsInput)
});

var testFile2 = new Vinyl({
	cwd: "/home/terin/broken-promises/",
	base: "/home/terin/broken-promises/test",
	path: "/home/terin/broken-promises/test/test2.js",
	contents: new Buffer(testOkContentsInput)
});

test('should report files in error', function(t) {
	t.plan(6);

	var stream = gulpUglify();

	stream.on('data', function() {
		t.fail('we shouldn\'t have gotten here');
	});

	stream.on('error', function(e) {
		t.ok(e instanceof Error, 'argument should be of type error');
		t.equal(e.plugin, 'gulp-uglify', 'error is from gulp-uglify');
		t.equal(e.fileName, testFile1.path, 'error reports correct file name');
		t.equal(e.lineNumber, 2, 'error reports correct line number');
		t.ok(e.stack, 'error has a stack');
		t.false(e.showStack, 'error is configured to not print the stack');
	});

	stream.write(testFile1);
	stream.end();
});

test('shouldn\'t blow up when given output options', function(t) {
	t.plan(5);

	var stream = gulpUglify({
		output: {
			exportAll: true
		}
	});

	stream.on('data', function() {
		t.fail('We shouldn\'t have gotten here');
	});

	stream.on('error', function(e) {
		t.ok(e instanceof Error, 'argument should be of type error');
		t.equals(e.message, testFile2.path + ': `exportAll` is not a supported option');
		t.equal(e.plugin, 'gulp-uglify', 'error is from gulp-uglify');
		t.equal(e.fileName, testFile2.path, 'error reports correct file name');
		t.false(e.showStack, 'error is configured to not print the stack');
	});

	stream.write(testFile2);
	stream.end();
});

test('should complete with custom errorHandler that ignores errors', function(t) {
	t.plan(7);

	var stream = gulpUglify({
		errorHandler: function(err, file, callback) {
      console.log('  Uglify error: ', err.message);
      callback(null, file);
    }
	});

  stream.on('data', function(newFile) {
		t.ok(newFile, 'emits a file');
		t.ok(newFile.path, 'file has a path');
		t.ok(newFile.relative, 'file has relative path information');
		t.ok(newFile.contents, 'file has contents');

		t.ok(newFile instanceof Vinyl, 'file is Vinyl');
		t.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

		t.equals(String(newFile.contents), testContentsInput);
	});

	stream.write(testFile1);
	stream.end();
});

