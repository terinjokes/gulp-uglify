'use strict';
var mocha = require('mocha');
var assert = require('power-assert');
var Vinyl = require('vinyl');
var td = require('testdouble');
var mississippi = require('mississippi');
var minifer = require('../minifier');

var pipe = mississippi.pipe;
var from = mississippi.from;
var to = mississippi.to;

var describe = mocha.describe;
var it = mocha.it;

describe('injecting mocha', function() {
  it('should minify files', function(done) {
    var testContentsOutput = 'function abs(a, b) {\n  return a > b; }';
    var testContentsInput = 'function testInput() {}';
    var testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test1.js',
      contents: new Buffer(testContentsInput)
    });

    var uglifyjs = td.object(['minify']);

    td
      .when(
        uglifyjs.minify(
          {
            'test1.js': testContentsInput
          },
          {
            injecting: true,
            output: {}
          }
        )
      )
      .thenReturn({
        code: testContentsOutput
      });

    pipe(
      [
        from.obj([testFile]),
        minifer({injecting: true}, uglifyjs),
        to.obj(function(newFile, enc, next) {
          assert.ok(newFile, 'emits a file');
          assert.ok(newFile.path, 'file has a path');
          assert.ok(newFile.relative, 'file has relative path information');
          assert.ok(newFile.contents, 'file has contents');

          assert.ok(newFile instanceof Vinyl, 'file is Vinyl');
          assert.ok(
            newFile.contents instanceof Buffer,
            'file contents are a buffer'
          );

          assert.equal(String(newFile.contents), testContentsOutput);
          next();
        })
      ],
      done
    );
  });
});
