'use strict';
var mocha = require('mocha');
var assert = require('assert');
var Vinyl = require('vinyl');
var createError = require('../lib/create-error');
var GulpUglifyError = require('../lib/gulp-uglify-error');

var describe = mocha.describe;
var it = mocha.it;
var beforeEach = mocha.beforeEach;

describe('createError', function() {
  beforeEach(function() {
    var testOkContentsInput =
      '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';
    this.testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test2.js',
      contents: new Buffer(testOkContentsInput)
    });
  });

  it('should have expected error message', function() {
    var e = createError(this.testFile, 'error message text', null);

    assert.ok(e instanceof Error, 'argument should be of type Error');
    assert.ok(
      e instanceof GulpUglifyError,
      'argument should be of type GulpUglifyError'
    );
    assert.equal(e.plugin, 'gulp-uglify', 'error is from gulp-uglify');
    assert.equal(e.message, 'error message text');
    assert.ok(!e.cause, 'should not contain a cause');
  });

  it('should wrap cause', function() {
    var cause = new Error('boom!');
    var e = createError(this.testFile, 'error message text', cause);

    assert.ok(e instanceof Error, 'argument should be of type Error');
    assert.ok(
      e instanceof GulpUglifyError,
      'argument should be of type GulpUglifyError'
    );
    assert.equal(e.plugin, 'gulp-uglify', 'error is from gulp-uglify');
    assert.ok(e.message.match(/^error message text/));
    assert.equal(e.cause, cause);
  });
});
