'use strict';
var test = require('tape');
var Vinyl = require('vinyl');
var td = require('testdouble');
var mississippi = require('mississippi');
var minifer = require('../minifier');

var pipe = mississippi.pipe;
var from = mississippi.from;
var to = mississippi.to;

var testContentsOutput = 'function abs(a, b) {\n  return a > b; }';
var testContentsInput = 'function testInput() {}';
var testFile = new Vinyl({
  cwd: '/home/terin/broken-promises/',
  base: '/home/terin/broken-promises/test',
  path: '/home/terin/broken-promises/test/test1.js',
  contents: new Buffer(testContentsInput)
});

test('should minify files', function (t) {
  t.plan(7);

  var uglifyjs = td.object(['minify']);

  td.when(uglifyjs.minify({
    'test1.js': testContentsInput
  }, {
    injecting: true,
    fromString: true,
    output: {}
  })).thenReturn({
    code: testContentsOutput
  });

  pipe([
    from.obj([testFile]),
    minifer({injecting: true}, uglifyjs),
    to.obj(function (newFile, enc, next) {
      t.ok(newFile, 'emits a file');
      t.ok(newFile.path, 'file has a path');
      t.ok(newFile.relative, 'file has relative path information');
      t.ok(newFile.contents, 'file has contents');

      t.ok(newFile instanceof Vinyl, 'file is Vinyl');
      t.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

      t.equals(String(newFile.contents), testContentsOutput);
      next();
    })
  ], t.end);
});
