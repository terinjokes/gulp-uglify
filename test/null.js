'use strict';
var mocha = require('mocha');
var assert = require('assert');
var Vinyl = require('vinyl');
var td = require('testdouble');
var minify = require('../lib/minify');

var describe = mocha.describe;
var it = mocha.it;
var beforeEach = mocha.beforeEach;

describe('null Vinyl contents', function() {
  beforeEach(function() {
    this.testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test1.js',
      contents: null
    });
  });

  it('should passthrough null files', function() {
    var uglify = td.object(['minify']);
    var logger = td.object(['warn']);

    var subject = minify(uglify, logger)({});

    var file = subject(this.testFile);

    assert.strictEqual(file, this.testFile);

    td.verify(logger.warn(), {times: 0, ignoreExtraArgs: true});
    td.verify(uglify.minify(), {times: 0, ignoreExtraArgs: true});
  });
});
