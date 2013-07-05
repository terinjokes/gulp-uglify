var gulp = require('gulp'),
		expect = require('chai').expect,
		uglify = require('../'),
		uglifyjs = require('uglify-js'),
		es = require('event-stream'),
		path = require('path');

require('mocha');

describe('gulp-uglify minification', function() {
	describe('gulp-uglify', function() {
		var filename = path.join(__dirname, './fixtures/data.js');
		it('should minify my files', function(done) {
			gulp.file(filename)
				.pipe(uglify())
				.pipe(es.map(function(file){
					var expected = uglifyjs.minify(filename).code;
					expect(expected).to.equal(String(file.contents));
					done();
				}));
		});

		it('should return file.contents as a buffer', function(done) {
			gulp.file(filename)
				.pipe(uglify())
				.pipe(es.map(function(file) {
					expect(file.contents).to.be.an.instanceof(Buffer);
					done();
				}));
		});
	});
});