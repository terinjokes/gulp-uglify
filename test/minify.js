'use strict';
var mocha = require('mocha');
var assert = require('assert');
var Vinyl = require('vinyl');
var td = require('testdouble');
var minify = require('../lib/minify');

var describe = mocha.describe;
var it = mocha.it;
var beforeEach = mocha.beforeEach;

describe('minify', function() {
  var testContentsInput =
    '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';

  beforeEach(function() {
    this.log = td.object(['warn']);

    this.testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test1.js',
      contents: new Buffer(testContentsInput)
    });
  });

  it('should minify files', function() {
    var uglify = td.object(['minify']);
    var logger = td.object(['warn']);

    td
      .when(
        uglify.minify(
          {
            'test1.js': testContentsInput
          },
          {
            output: {}
          }
        )
      )
      .thenReturn({
        code: 'foobar'
      });

    var subject = minify(uglify, logger)({});
    var file = subject(this.testFile);

    assert.ok(file instanceof Vinyl);
    assert.ok(Buffer.isBuffer(file.contents));
    assert.equal(String(file.contents), 'foobar');

    td.verify(logger.warn(), {
      times: 0,
      ignoreExtraArgs: true
    });
  });

  it('string argument should cause warning', function() {
    var uglify = td.object(['minify']);
    var logger = td.object(['warn']);

    td
      .when(
        uglify.minify(
          {
            'test1.js': testContentsInput
          },
          {
            output: {}
          }
        )
      )
      .thenReturn({
        code: 'foobar'
      });

    var subject = minify(uglify, logger)('build.min.js');
    var file = subject(this.testFile);

    td.verify(
      logger.warn('gulp-uglify expects an object, non-object provided')
    );

    assert.ok(file instanceof Vinyl);
    assert.ok(Buffer.isBuffer(file.contents));
    assert.equal(String(file.contents), 'foobar');
  });
});
