'use strict';
var mocha = require('mocha');
var assert = require('power-assert');
var Vinyl = require('vinyl');
var uglifyjs = require('uglify-js');
var mississippi = require('mississippi');
var gulpUglify = require('../');

var pipe = mississippi.pipe;
var to = mississippi.to;
var from = mississippi.from;

var describe = mocha.describe;
var it = mocha.it;

describe('no-compress', function () {
  it('should not compress files when `compress: false`', function (done) {
    var testContentsInput = '"use strict"; (function(console, first, second) {\n\tconsole.log(first + second)\n}(5, 10))';
    var testContentsExpected = uglifyjs.minify(testContentsInput, {
      fromString: true,
      compress: false
    }).code;

    var testFile1 = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test1.js',
      contents: new Buffer(testContentsInput)
    });

    pipe([
      from.obj([testFile1]),
      gulpUglify({
        compress: false
      }),
      to.obj(function (newFile, enc, next) {
        assert.ok(newFile, 'emits a file');
        assert.ok(newFile.path, 'file has a path');
        assert.ok(newFile.relative, 'file has relative path information');
        assert.ok(newFile.contents, 'file has contents');

        assert.ok(newFile instanceof Vinyl, 'file is Vinyl');
        assert.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

        assert.equal(String(newFile.contents), testContentsExpected);
        next();
      })
    ], done);
  });
});
