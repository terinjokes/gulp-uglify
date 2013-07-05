var gulp = require('gulp'),
		expect = require('chai').expect,
		uglify = require('../'),
		uglifyjs = require('uglify-js'),
		es = require('event-stream'),
		path = require('path');

require('mocha');

describe('gulp-uglify minification', function() {
	describe('gulp-uglify', function() {
		it('should minify my files', function(done) {
			var filename = path.join(__dirname, './fixtures/data.js'),
			stream = gulp.files(path.join(__dirname, './fixtures/data.js'))
			  .pipe(uglify)
			  .pipe(es.map(function(file, callback){
			  	var expected = uglifyjs.minify(filename).code;
			  	expect(expected).to.equal(String(file.contents));
			  	done();
			  }));
		});
	});
});