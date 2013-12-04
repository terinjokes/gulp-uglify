'use strict';
/* globals describe, it */
var gulp = require('gulp'),
		expect = require('chai').expect,
		uglify = require('../'),
		uglifyjs = require('uglify-js'),
		es = require('event-stream'),
		fs = require('fs'),
		path = require('path');

describe('gulp-uglify minification', function() {
	describe('gulp-uglify', function() {
		it('should minify my files', function(done) {
			var filename = path.join(__dirname, './fixtures/data.js');
			gulp.src(filename)
				.pipe(uglify())
				.pipe(es.map(function(file){
					var expected = uglifyjs.minify(filename).code;
					expect(String(file.contents)).to.equal(expected);
					done();
				}));
		});

		it('should return file.contents as a buffer', function(done) {
			var filename = path.join(__dirname, './fixtures/data.js');
			gulp.src(filename)
				.pipe(uglify())
				.pipe(es.map(function(file) {
					expect(file.contents).to.be.an.instanceof(Buffer);
					done();
				}));
		});

		it('should return original contents in error', function(done) {
			var filename = path.join(__dirname, './fixtures/error.js');
			gulp.src(filename)
				.pipe(uglify())
				.pipe(es.map(function(file) {
					var expected = fs.readFileSync(filename, 'utf-8');
					expect(String(file.contents)).to.equal(expected);
					done();
				}));
		});
	});
});
