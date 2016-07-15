'use strict';
var test = require('tape');
var Vinyl = require('vinyl');
var uglifyjs = require('uglify-js');
var gulplog = require('gulplog');
var mississippi = require('mississippi');
var gulpUglify = require('../');

var testContentsInput = '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';
var testContentsExpected = uglifyjs.minify(testContentsInput, {fromString: true}).code;

var pipe = mississippi.pipe;
var to = mississippi.to;
var from = mississippi.from;

var testFile1 = new Vinyl({
  cwd: '/home/terin/broken-promises/',
  base: '/home/terin/broken-promises/test',
  path: '/home/terin/broken-promises/test/test1.js',
  contents: new Buffer(testContentsInput)
});

test('should minify files', function (t) {
  t.plan(7);

  pipe([
    from.obj([testFile1]),
    gulpUglify(),
    to.obj(function (newFile, enc, next) {
      t.ok(newFile, 'emits a file');
      t.ok(newFile.path, 'file has a path');
      t.ok(newFile.relative, 'file has relative path information');
      t.ok(newFile.contents, 'file has contents');

      t.ok(newFile instanceof Vinyl, 'file is Vinyl');
      t.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

      t.equals(String(newFile.contents), testContentsExpected);
      next();
    })
  ], t.end);
});

test('should minify files when string is passed as argument', function (t) {
  t.plan(8);

  gulplog.on('warn', function (msg) {
    t.ok(msg, 'gulp-uglify expects an object, non-object provided');
  });

  pipe([
    from.obj([testFile1]),
    gulpUglify('build.min.js'),
    to.obj(function (newFile, enc, next) {
      t.ok(newFile, 'emits a file');
      t.ok(newFile.path, 'file has a path');
      t.ok(newFile.relative, 'file has relative path information');
      t.ok(newFile.contents, 'file has contents');

      t.ok(newFile instanceof Vinyl, 'file is Vinyl');
      t.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

      t.equals(String(newFile.contents), testContentsExpected);
      next();
    })
  ], t.end);
});
