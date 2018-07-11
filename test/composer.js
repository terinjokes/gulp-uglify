'use strict';
var mocha = require('mocha');
var assert = require('assert');
var Vinyl = require('vinyl');
var td = require('testdouble');
var through = require('through2');
var composer = require('../composer');
var GulpUglifyError = require('../lib/gulp-uglify-error');

var describe = mocha.describe;
var it = mocha.it;

describe('composer', function() {
  it('should forward errors', function() {
    var badJsFile = new Vinyl({
      cwd: '/',
      base: '/test/',
      path: '/test/file.js',
      contents: new Buffer('invalid js')
    });

    var uglify = td.object(['minify']);
    var logger = td.object(['warn']);
    var composed = composer(uglify, logger)({});

    assert.throws(function() {
      composed.write(badJsFile);
    }, GulpUglifyError);
  });
  it('should not callback twice', function() {
    var expectedErr = new Error();
    var jsFile = new Vinyl({
      cwd: '/',
      base: '/test/',
      path: '/test/file.js',
      contents: new Buffer('var x = 123')
    });

    var thrower = through.obj(function() {
      throw expectedErr;
    });

    var uglify = td.object(['minify']);
    var logger = td.object(['warn']);
    td
      .when(
        uglify.minify(
          {'file.js': 'var x = 123'},
          {
            output: {}
          }
        )
      )
      .thenReturn({
        code: '',
        map: {}
      });

    var composed = composer(uglify, logger)({});
    composed.pipe(thrower);

    assert.throws(
      function() {
        composed.write(jsFile);
      },
      function(err) {
        assert.strictEqual(err, expectedErr);
        return true;
      }
    );
  });
});
