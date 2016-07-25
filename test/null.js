'use strict';
var mocha = require('mocha');
var assert = require('power-assert');
var Vinyl = require('vinyl');
var mississippi = require('mississippi');
var gulpUglify = require('../');

var describe = mocha.describe;
var it = mocha.it;
var beforeEach = mocha.beforeEach;

var pipe = mississippi.pipe;
var to = mississippi.to;
var from = mississippi.from;

describe('null Vinyl contents', function () {
  beforeEach(function () {
    this.testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test1.js',
      contents: null
    });
  });

  it('should passthrough null files', function (done) {
    pipe([
      from.obj([this.testFile]),
      gulpUglify(),
      to.obj(function (newFile, enc, next) {
        assert.ok(newFile, 'emits a file');
        assert.ok(newFile.path, 'file has a path');
        assert.ok(newFile.relative, 'file has relative path information');
        assert.ok(!newFile.contents, 'file does not have contents');

        assert.ok(newFile instanceof Vinyl, 'file is Vinyl');

        assert.strictEqual(newFile.contents, null);
        next();
      })
    ], done);
  });
});
