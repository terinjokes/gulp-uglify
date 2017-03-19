'use strict';
var mocha = require('mocha');
var assert = require('power-assert');
var Vinyl = require('vinyl');
var mississippi = require('mississippi');
var GulpUglifyError = require('../lib/gulp-uglify-error');
var gulpUglify = require('../');

var pipe = mississippi.pipe;
var to = mississippi.to;
var from = mississippi.from;

var describe = mocha.describe;
var it = mocha.it;

describe('stream errors', function() {
  it('should report files in error', function(done) {
    var testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test1.js',
      contents: new Buffer('function errorFunction(error)\n{')
    });

    pipe(
      [
        from.obj([testFile]),
        gulpUglify(),
        to.obj(function(chunk, enc, next) {
          assert(false, 'we shouldn\t have gotten here');
          next();
        })
      ],
      function(err) {
        assert.ok(err instanceof Error, 'argument should be of type Error');
        assert.ok(
          err instanceof GulpUglifyError,
          'argument should be of type GulpUglifyError'
        );
        assert.equal(err.plugin, 'gulp-uglify', 'error is from gulp-uglify');
        assert.equal(
          err.fileName,
          testFile.path,
          'error reports correct file name'
        );
        assert.equal(err.cause.line, 2, 'error reports correct line number');
        assert.ok(err.stack, 'error has a stack');
        assert.ok(!err.showStack, 'error is configured to not print the stack');
        done();
      }
    );
  });

  it("shouldn't blow up when given output options", function(done) {
    var testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test2.js',
      contents: new Buffer(
        '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))'
      )
    });

    pipe(
      [
        from.obj([testFile]),
        gulpUglify({
          output: {
            exportAll: true
          }
        }),
        to.obj(function(chunk, enc, next) {
          assert(false, 'we shouldn\t have gotten here');
          next();
        })
      ],
      function(err) {
        assert.ok(err instanceof Error, 'argument should be of type Error');
        assert.ok(
          err instanceof GulpUglifyError,
          'argument should be of type GulpUglifyError'
        );
        assert.equal(
          err.cause.message,
          '`exportAll` is not a supported option'
        );
        assert.equal(err.plugin, 'gulp-uglify', 'error is from gulp-uglify');
        assert.equal(
          err.fileName,
          testFile.path,
          'error reports correct file name'
        );
        assert.ok(!err.showStack, 'error is configured to not print the stack');
        done();
      }
    );
  });
});
