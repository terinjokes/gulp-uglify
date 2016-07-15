'use strict';
var test = require('tape');
var Vinyl = require('vinyl');
var mississippi = require('mississippi');
var gulpUglify = require('../');

var pipe = mississippi.pipe;
var to = mississippi.to;
var from = mississippi.from;

var testFile1 = new Vinyl({
  cwd: '/home/terin/broken-promises/',
  base: '/home/terin/broken-promises/test',
  path: '/home/terin/broken-promises/test/test1.js',
  contents: null
});

test('should leave null files as is', function (t) {
  t.plan(6);

  pipe([
    from.obj([testFile1]),
    gulpUglify(),
    to.obj(function (newFile, enc, next) {
      t.ok(newFile, 'emits a file');
      t.ok(newFile.path, 'file has a path');
      t.ok(newFile.relative, 'file has relative path information');
      t.ok(!newFile.contents, 'file does not have contents');

      t.ok(newFile instanceof Vinyl, 'file is Vinyl');

      t.equals(newFile.contents, null);
      next();
    })
  ], t.end);
});
