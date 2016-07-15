'use strict';
var test = require('tape');
var Vinyl = require('vinyl');
var mississippi = require('mississippi');
var GulpUglifyError = require('../lib/gulp-uglify-error');
var gulpUglify = require('../');

var testContentsInput = 'function errorFunction(error)\n{';
var testOkContentsInput = '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';

var pipe = mississippi.pipe;
var to = mississippi.to;
var from = mississippi.from;

var testFile1 = new Vinyl({
  cwd: '/home/terin/broken-promises/',
  base: '/home/terin/broken-promises/test',
  path: '/home/terin/broken-promises/test/test1.js',
  contents: new Buffer(testContentsInput)
});

var testFile2 = new Vinyl({
  cwd: '/home/terin/broken-promises/',
  base: '/home/terin/broken-promises/test',
  path: '/home/terin/broken-promises/test/test2.js',
  contents: new Buffer(testOkContentsInput)
});

test('should report files in error', function (t) {
  t.plan(7);

  pipe([
    from.obj([testFile1]),
    gulpUglify(),
    to.obj(function (chunk, enc, next) {
      t.fail('we shouldn\t have gotten here');
      next();
    })
  ], function (err) {
    t.ok(err instanceof Error, 'argument should be of type Error');
    t.ok(err instanceof GulpUglifyError, 'argument should be of type GulpUglifyError');
    t.equal(err.plugin, 'gulp-uglify', 'error is from gulp-uglify');
    t.equal(err.fileName, testFile1.path, 'error reports correct file name');
    t.equal(err.cause.line, 2, 'error reports correct line number');
    t.ok(err.stack, 'error has a stack');
    t.false(err.showStack, 'error is configured to not print the stack');
  });
});

test('shouldn\'t blow up when given output options', function (t) {
  t.plan(6);

  pipe([
    from.obj([testFile2]),
    gulpUglify({
      output: {
        exportAll: true
      }
    }),
    to.obj(function (chunk, enc, next) {
      t.fail('We shouldn\'t have gotten here');
      next();
    })
  ], function (err) {
    t.ok(err instanceof Error, 'argument should be of type Error');
    t.ok(err instanceof GulpUglifyError, 'argument should be of type GulpUglifyError');
    t.equals(err.cause.msg, '`exportAll` is not a supported option');
    t.equal(err.plugin, 'gulp-uglify', 'error is from gulp-uglify');
    t.equal(err.fileName, testFile2.path, 'error reports correct file name');
    t.false(err.showStack, 'error is configured to not print the stack');
  });
});
