'use strict';
var mocha = require('mocha');
var assert = require('assert');
var GulpUglifyError = require('../lib/gulp-uglify-error');
var td = require('testdouble');
var minify = require('../lib/minify');

var describe = mocha.describe;
var it = mocha.it;

describe('stream Vinyl contents', function() {
  it('should emit error for stream files', function() {
    var uglify = td.object(['minify']);
    var logger = td.object(['warn']);
    var file = td.object(['isNull', 'isStream']);

    var subject = minify(uglify, logger)({});

    td.when(file.isNull()).thenReturn(false);
    td.when(file.isStream()).thenReturn(true);

    assert.throws(function() {
      subject(file);
    }, GulpUglifyError);
  });
});
