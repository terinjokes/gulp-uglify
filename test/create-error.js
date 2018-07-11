'use strict';
var test = require('tape-catch');
var assert = require('assert');
var Buffer = require('safe-buffer').Buffer;
var Vinyl = require('vinyl');
var createError = require('../lib/create-error');
var GulpUglifyError = require('../lib/gulp-uglify-error');

test('createError has error message', function(t) {
  var e = createError(createTestFile(), 'error message text', null);

  assert.ok(e instanceof Error, 'argument should be of type Error');
  assert.ok(
    e instanceof GulpUglifyError,
    'argument should be of type GulpUglifyError'
  );
  assert.equal(e.plugin, 'gulp-uglify', 'error is from gulp-uglify');
  assert.equal(e.message, 'error message text');
  assert.ok(!e.cause, 'should not contain a cause');

  t.end();
});

test('createError wraps cause', function(t) {
  var cause = new Error('boom!');
  var e = createError(createTestFile(), 'error message text', cause);

  assert.ok(e instanceof Error, 'argument should be of type Error');
  assert.ok(
    e instanceof GulpUglifyError,
    'argument should be of type GulpUglifyError'
  );
  assert.equal(e.plugin, 'gulp-uglify', 'error is from gulp-uglify');
  assert.ok(e.message.match(/^error message text/));
  assert.equal(e.cause, cause);

  t.end();
});

function createTestFile() {
  var testOkContentsInput =
    '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';

  return new Vinyl({
    cwd: '/home/terin/broken-promises/',
    base: '/home/terin/broken-promises/test',
    path: '/home/terin/broken-promises/test/test2.js',
    contents: Buffer.from(testOkContentsInput)
  });
}
