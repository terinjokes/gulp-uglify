'use strict';
var td = require('testdouble');

var mocha = require('mocha');
var assert = require('power-assert');
var Vinyl = require('vinyl');
var uglifyjs = require('uglify-js');
var mississippi = require('mississippi');
var version = require('semver')(process.version);

var composer = require('../composer');

var pipe = mississippi.pipe;
var to = mississippi.to;
var from = mississippi.from;

var describe = mocha.describe;
var it = mocha.it;
var beforeEach = mocha.beforeEach;

describe('minify', function() {
  var testContentsInput =
    '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';
  var testContentsExpected = uglifyjs.minify(testContentsInput).code;

  beforeEach(function() {
    this.log = td.object(['warn']);

    this.testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test1.js',
      contents: new Buffer(testContentsInput)
    });
  });

  it('should minify files', function(done) {
    var log = this.log;

    pipe(
      [
        from.obj([this.testFile]),
        composer(uglifyjs, log)({}),
        to.obj(function(newFile, enc, next) {
          td.verify(log.warn(), {
            times: 0,
            ignoreExtraArgs: true
          });

          assert.ok(newFile, 'emits a file');
          assert.ok(newFile.path, 'file has a path');
          assert.ok(newFile.relative, 'file has relative path information');
          assert.ok(newFile.contents, 'file has contents');

          assert.ok(newFile instanceof Vinyl, 'file is Vinyl');
          assert.ok(
            newFile.contents instanceof Buffer,
            'file contents are a buffer'
          );

          assert.equal(String(newFile.contents), testContentsExpected);
          next();
        })
      ],
      done
    );
  });

  if (version.major > 0 || version.minor >= 11) {
    it('string argument should cause warning', function(done) {
      var log = this.log;

      pipe(
        [
          from.obj([this.testFile]),
          composer(uglifyjs, log)('build.min.js'),
          to.obj(function(newFile, enc, next) {
            td.verify(
              log.warn('gulp-uglify expects an object, non-object provided')
            );

            assert.ok(newFile, 'emits a file');
            assert.ok(newFile.path, 'file has a path');
            assert.ok(newFile.relative, 'file has relative path information');
            assert.ok(newFile.contents, 'file has contents');

            assert.ok(newFile instanceof Vinyl, 'file is Vinyl');
            assert.ok(
              newFile.contents instanceof Buffer,
              'file contents are a buffer'
            );

            assert.equal(String(newFile.contents), testContentsExpected);
            next();
          })
        ],
        done
      );
    });
  }
});
