'use strict';
var test = require('tape');
var assert = require('assert');
var GulpUglifyError = require('../lib/gulp-uglify-error');
var td = require('testdouble');
var minify = require('../lib/minify');

test('stream Vinyls should emit error', function(t) {
  var uglify = td.object(['minify']);
  var logger = td.object(['warn']);
  var file = td.object(['isNull', 'isStream']);

  var subject = minify(uglify, logger)({});

  td.when(file.isNull()).thenReturn(false);
  td.when(file.isStream()).thenReturn(true);

  assert.throws(function() {
    subject(file);
  }, GulpUglifyError);
  td.reset();
  t.end();
});
