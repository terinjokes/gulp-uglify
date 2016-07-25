'use strict';
var mocha = require('mocha');
var assert = require('power-assert');
var Vinyl = require('vinyl');
var mississippi = require('mississippi');
var GulpUglifyError = require('../lib/gulp-uglify-error');
var gulpUglify = require('../');

var pipe = mississippi.pipe;
var to = mississippi.to;
var from = mississippi.from;

var describe = mocha.describe;
var it = mocha.it;

describe('stream Vinyl contents', function () {
  var testFile = new Vinyl({
    cwd: '/home/terin/broken-promises/',
    base: '/home/terin/broken-promises/test',
    path: '/home/terin/broken-promises/test/test1.js',
    contents: from('terin')
  });

  it('should emit error for stream files', function (done) {
    pipe([
      from.obj([testFile]),
      gulpUglify(),
      to.obj(function (chunk, enc, next) {
        assert(false, 'should emit error for streams');
        next();
      })
    ], function (err) {
      assert.ok(err instanceof GulpUglifyError, 'error is a GulpUglifyError');
      assert.equal(err.plugin, 'gulp-uglify', 'error is from gulp-uglify');
      assert.equal(err.fileName, testFile.path, 'error reports the correct file');

      assert.ok(err.stack, 'error has a stack');
      assert.ok(!err.showStack, 'error is configured to not print stack');
      done();
    });
  });
});
