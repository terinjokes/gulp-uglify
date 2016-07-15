'use strict';
var test = require('tape');
var Vinyl = require('vinyl');
var cmem = require('cmem');
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
var uglifyjs = {
  minify: cmem(function () {
    return {
      code: testContentsOutput
    };
  })
};

test('should minify files', function (t) {
  t.plan(10);

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

      t.equals(uglifyjs.minify.$count, 1, 'minify stub was called only once');
      t.deepEqual(uglifyjs.minify.$args[0], {
        'test1.js': testContentsInput
      }, 'stub argument 0 was the expected input');
      t.deepEqual(uglifyjs.minify.$args[1], {
        fromString: true,
        output: {},
        injecting: true
      }, 'stub argument 1 was the expected options');
      next();
    })
  ], t.end);
});
