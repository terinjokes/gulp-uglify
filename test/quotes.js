'use strict';
var test = require('tape'),
		Vinyl = require('vinyl'),
		gulpUglify = require('../');


test('should convert to single quotes', function(t) {
	t.plan(1);

	var testFile1 = new Vinyl({
		cwd: "/home/terin/broken-promises/",
		base: "/home/terin/broken-promises/test",
		path: "/home/terin/broken-promises/test/test1.js",
		contents: new Buffer('function llama() { return "Yay";}')
	});

	var stream = gulpUglify({ quoteStyle: 'single' });

	stream.on('data', function(newFile) {
		var contents = newFile.contents.toString();
		t.ok(/'Yay'/.test(contents), 'has single quotes');
	});

	stream.write(testFile1);
	stream.end();
});

test('should convert to double quotes', function(t) {
	t.plan(1);

	var testFile1 = new Vinyl({
		cwd: "/home/terin/broken-promises/",
		base: "/home/terin/broken-promises/test",
		path: "/home/terin/broken-promises/test/test1.js",
		contents: new Buffer("function llama() { return 'Yay';}")
	});

	var stream = gulpUglify({ quoteStyle: 'double' });

	stream.on('data', function(newFile) {
		var contents = newFile.contents.toString();
		t.ok(/"Yay"/.test(contents), 'has double quotes');
	});

	stream.write(testFile1);
	stream.end();
});


test('should preserve original quotes', function(t) {
	t.plan(1);

	var testFile1 = new Vinyl({
		cwd: "/home/terin/broken-promises/",
		base: "/home/terin/broken-promises/test",
		path: "/home/terin/broken-promises/test/test1.js",
		contents: new Buffer("function llama() { return 'Yay, it\\\'s \"working\"!';}")
	});

	var stream = gulpUglify({ quoteStyle: 'original' });

	stream.on('data', function(newFile) {
		var contents = newFile.contents.toString();
		t.ok(/'Yay, it\\\'s \"working\"!'/.test(contents), 'has preserved quotes');
	});

	stream.write(testFile1);
	stream.end();
});

test('should use default style', function(t) {
	t.plan(1);

	var testFile1 = new Vinyl({
		cwd: "/home/terin/broken-promises/",
		base: "/home/terin/broken-promises/test",
		path: "/home/terin/broken-promises/test/test1.js",
		contents: new Buffer('function llama() { return {a: \'single\', b: "double", c: "mixed \\\'"}}')
	});

	var stream = gulpUglify({ quoteStyle: 0 });

	stream.on('data', function(newFile) {
		var contents = newFile.contents.toString();
		t.ok(/"single"/.test(contents), 'has preserved quotes');
	});

	stream.write(testFile1);
	stream.end();
});
