'use strict';
/* globals describe, it */
var gulp = require('gulp'),
		expect = require('chai').expect,
		uglify = require('..'),
		uglifyjs = require('uglify-js'),
		es = require('event-stream'),
		fs = require('fs'),
		path = require('path');

describe('gulp-uglify', function() {
	describe('minification', function() {
		var filename = path.join(__dirname, 'fixtures/data.js');
		it('should minify my files', function(done) {
			gulp.src(filename)
				.pipe(uglify())
				.pipe(es.map(function(file){
					var expected = uglifyjs.minify(filename).code;
					expect(String(file.contents)).to.equal(expected);
					done();
				}));
		});

		it('should correctly scrape name for dynamically named map files', function (done) {
			gulp.src(filename)
				.pipe(uglify({ outSourceMap: path.join(__dirname, 'fixtures/*.js.map') }))
				.pipe(es.map(function(file){
					fs.readdir('test/fixtures', function (err, files) {
						if (err) throw err;
						expect(files).to.include.members(['data.js.map']);
						done();
					});
				}));	
		});

		it('should generate the correct map file', function (done) {
			gulp.src(filename)
				.pipe(uglify({ outSourceMap: path.join(__dirname, 'fixtures/*.js.map') }))
				.pipe(es.map(function(file){
					fs.readFile(path.join(__dirname, 'fixtures/data.js'), 'utf8', function (err, javascript) {
						if (err) throw err;

						var expected = uglifyjs.minify(javascript, { fromString: true, outSourceMap: 'data.js.map' }).map;

						fs.readFile(path.join(__dirname, 'fixtures/data.js.map'), 'utf8', function (err, mapFile) {
							if (err) throw err;
							expect(mapFile).to.equal(expected);
							done();
						});
					});
				}));				
		})

		it('should return file.contents as a buffer', function(done) {
			var filename = path.join(__dirname, 'fixtures/data.js');
			gulp.src(filename)
				.pipe(uglify())
				.pipe(es.map(function(file) {
					expect(file.contents).to.be.an.instanceof(Buffer);
					done();
				}));
		});

		it('should return original contents in error', function(done) {
			var filename = path.join(__dirname, 'fixtures/error.js');
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
