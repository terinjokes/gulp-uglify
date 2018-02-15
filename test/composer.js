'use strict';
var test = require('tape-catch');
var assert = require('assert');
var Buffer = require('safe-buffer').Buffer;
var Vinyl = require('vinyl');
var td = require('testdouble');
var through = require('through2');
var composer = require('../composer');
var GulpUglifyError = require('../lib/gulp-uglify-error');

test('composer should forward errors', function(t) {
  var badJsFile = new Vinyl({
    cwd: '/',
    base: '/test/',
    path: '/test/file.js',
    contents: Buffer.from('invalid js')
  });

  var uglify = td.object(['minify']);
  var logger = td.object(['warn']);
  var composed = composer(uglify, logger)({});

  assert.throws(function() {
    composed.write(badJsFile);
  }, GulpUglifyError);

  td.reset();
  t.end();
});

test("compose doesn't invoke callback twice", function(t) {
  var expectedErr = new Error();
  var jsFile = new Vinyl({
    cwd: '/',
    base: '/test/',
    path: '/test/file.js',
    contents: Buffer.from('var x = 123')
  });

  var thrower = through.obj(function() {
    throw expectedErr;
  });

  var uglify = td.object(['minify']);
  var logger = td.object(['warn']);
  td.when(
    uglify.minify(
      {'file.js': 'var x = 123'},
      {
        output: {}
      }
    )
  ).thenReturn({
    code: '',
    map: {}
  });

  var composed = composer(uglify, logger)({});
  composed.pipe(thrower);

  assert.throws(
    function() {
      composed.write(jsFile);
    },
    function(err) {
      assert.strictEqual(err, expectedErr);
      return true;
    }
  );

  td.reset();
  t.end();
});
