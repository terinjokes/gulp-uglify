'use strict';
var test = require('tape'),
		Vinyl = require('vinyl'),
		gulpUglify = require('../'),
		Readable = require('stream').Readable,
		Stream = require('stream');
	
var testContentsInput = 'function errorFunction(error) {';

var testFile1 = new Vinyl({
	cwd: "/home/terin/broken-promises/",
	base: "/home/terin/broken-promises/test",
	path: "/home/terin/broken-promises/test/test1.js",
	contents: stringStream()
});

test('should emit error for stream files', function(t) {
	t.plan(1);

	var stream = gulpUglify();

	stream
		.on('data', function() {
			t.fail('should emit error for streams');
		})
		.on('error', function() {
			t.pass('emitted error');
		});

	stream.write(testFile1);
});

function stringStream() {
	var stream = new Readable();

	stream._read = function() {
		this.push('terin');
		this.push(null);
	};

	return stream;
}
