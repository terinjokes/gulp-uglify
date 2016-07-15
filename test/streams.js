'use strict';
var test = require('tape');
var Vinyl = require('vinyl');
var mississippi = require('mississippi');
var GulpUglifyError = require('../lib/gulp-uglify-error');
var gulpUglify = require('../');

var pipe = mississippi.pipe;
var to = mississippi.to;
var from = mississippi.from;

var testFile1 = new Vinyl({
  cwd: '/home/terin/broken-promises/',
  base: '/home/terin/broken-promises/test',
  path: '/home/terin/broken-promises/test/test1.js',
  contents: from('terin')
});

test('should emit error for stream files', function (t) {
  t.plan(6);

  pipe([
    from.obj([testFile1]),
    gulpUglify(),
    to.obj(function (chunk, enc, next) {
      t.fail('should emit error for streams');
      next();
    })
  ], function (err) {
    t.pass('emitted error');
    t.ok(err instanceof GulpUglifyError, 'error is a GulpUglifyError');
    t.equal(err.plugin, 'gulp-uglify', 'error is from gulp-uglify');
    t.equal(err.fileName, testFile1.path, 'error reports the correct file');

    t.ok(err.stack, 'error has a stack');
    t.false(err.showStack, 'error is configured to not print stack');
  });
});
