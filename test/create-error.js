'use strict';
var test = require('tape');
var Vinyl = require('vinyl');
var createError = require('../lib/create-error');
var GulpUglifyError = require('../lib/gulp-uglify-error');

var testOkContentsInput = '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';
var testFile = new Vinyl({
  cwd: '/home/terin/broken-promises/',
  base: '/home/terin/broken-promises/test',
  path: '/home/terin/broken-promises/test/test2.js',
  contents: new Buffer(testOkContentsInput)
});

test('should have expected error message', function (t) {
  t.plan(5);
  var e = createError(testFile, 'error message text', null);

  t.ok(e instanceof Error, 'argument should be of type Error');
  t.ok(e instanceof GulpUglifyError, 'argument should be of type GulpUglifyError');
  t.equal(e.plugin, 'gulp-uglify', 'error is from gulp-uglify');
  t.equal(e.message, 'error message text');
  t.notOk(e.cause, 'should not contain a cause');
});

test('should wrap cause', function (t) {
  t.plan(5);
  var cause = new Error('boom!');
  var e = createError(testFile, 'error message text', cause);

  t.ok(e instanceof Error, 'argument should be of type Error');
  t.ok(e instanceof GulpUglifyError, 'argument should be of type GulpUglifyError');
  t.equal(e.plugin, 'gulp-uglify', 'error is from gulp-uglify');
  t.ok(e.message.match(/^error message text/));
  t.equal(e.cause, cause);
});
