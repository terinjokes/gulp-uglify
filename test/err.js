'use strict';
var test = require('tape-catch');
var assert = require('assert');
var Buffer = require('safe-buffer').Buffer;
var Vinyl = require('vinyl');
var td = require('testdouble');
var GulpUglifyError = require('../lib/gulp-uglify-error');
var minify = require('../lib/minify');

test('errors should report files in error', function(t) {
  var testFile = new Vinyl({
    cwd: '/home/terin/broken-promises/',
    base: '/home/terin/broken-promises/test',
    path: '/home/terin/broken-promises/test/test1.js',
    contents: Buffer.from('function errorFunction(error)\n{')
  });
  var uglify = td.object(['minify']);
  var logger = td.object(['warn']);
  var expOptions = {
    output: {}
  };
  var err = new Error();
  err.line = 28889;

  td.when(
    uglify.minify(
      {
        'test1.js': 'function errorFunction(error)\n{'
      },
      expOptions
    )
  ).thenReturn({
    error: err
  });

  var subject = minify(uglify, logger)({});

  assert.throws(
    function() {
      subject(testFile);
    },
    function(err) {
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
      assert.equal(err.cause.line, 28889, 'error reports correct line number');
      assert.ok(err.stack, 'error has a stack');
      assert.ok(!err.showStack, 'error is configured to not print the stack');
      assert.ok(err instanceof Error, 'argument should be of type Error');

      return true;
    }
  );

  td.verify(logger.warn(), {times: 0, ignoreExtraArgs: true});
  td.reset();
  t.end();
});

test("errors shouldn't blow up", function(t) {
  var testFile = new Vinyl({
    cwd: '/home/terin/broken-promises/',
    base: '/home/terin/broken-promises/test',
    path: '/home/terin/broken-promises/test/test1.js',
    contents: Buffer.from('{}')
  });
  var uglify = td.object(['minify']);
  var logger = td.object(['warn']);
  var expOptions = {
    output: {
      exportAll: true
    }
  };
  var err = new Error('`exportAll` is not a supported option');

  td.when(
    uglify.minify(
      {
        'test1.js': '{}'
      },
      expOptions
    )
  ).thenReturn({
    error: err
  });

  var subject = minify(uglify, logger)({
    output: {
      exportAll: true
    }
  });

  assert.throws(
    function() {
      subject(testFile);
    },
    function(err) {
      assert.ok(err instanceof Error, 'argument should be of type Error');
      assert.ok(
        err instanceof GulpUglifyError,
        'argument should be of type GulpUglifyError'
      );
      assert.equal(err.cause.message, '`exportAll` is not a supported option');
      assert.equal(err.plugin, 'gulp-uglify', 'error is from gulp-uglify');
      assert.equal(
        err.fileName,
        testFile.path,
        'error reports correct file name'
      );
      assert.ok(!err.showStack, 'error is configured to not print the stack');

      return true;
    }
  );

  td.verify(logger.warn(), {times: 0, ignoreExtraArgs: true});
  td.reset();
  t.end();
});
