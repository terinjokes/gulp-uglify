'use strict';
var test = require('tape-catch');
var assert = require('assert');
var Vinyl = require('vinyl');
var td = require('testdouble');
var minify = require('../lib/minify');

test('null Vinyl should passthrough', function(t) {
  var testFile = new Vinyl({
    cwd: '/home/terin/broken-promises/',
    base: '/home/terin/broken-promises/test',
    path: '/home/terin/broken-promises/test/test1.js',
    contents: null
  });
  var uglify = td.object(['minify']);
  var logger = td.object(['warn']);

  var subject = minify(uglify, logger)({});

  var file = subject(testFile);

  assert.strictEqual(file, testFile);

  td.verify(logger.warn(), {times: 0, ignoreExtraArgs: true});
  td.verify(uglify.minify(), {times: 0, ignoreExtraArgs: true});
  td.reset();
  t.end();
});
