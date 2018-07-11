'use strict';
var test = require('tape');
var assert = require('assert');
var Vinyl = require('vinyl');
var Buffer = require('safe-buffer').Buffer;
var td = require('testdouble');
var minify = require('../lib/minify');

test('minify should work', function(t) {
  var testContentsInput =
    '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';
  var testFile = createTestFile(testContentsInput);
  var uglify = td.object(['minify']);
  var logger = td.object(['warn']);

  td.when(
    uglify.minify(
      {
        'test1.js': testContentsInput
      },
      {
        output: {}
      }
    )
  ).thenReturn({
    code: 'foobar'
  });

  var subject = minify(uglify, logger)({});
  var file = subject(testFile);

  assert.ok(file instanceof Vinyl);
  assert.ok(Buffer.isBuffer(file.contents));
  assert.equal(String(file.contents), 'foobar');

  td.verify(logger.warn(), {
    times: 0,
    ignoreExtraArgs: true
  });
  td.reset();
  t.end();
});

test('minify should warn with string argument', function(t) {
  var testContentsInput =
    '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';
  var testFile = createTestFile(testContentsInput);
  var uglify = td.object(['minify']);
  var logger = td.object(['warn']);

  td.when(
    uglify.minify(
      {
        'test1.js': testContentsInput
      },
      {
        output: {}
      }
    )
  ).thenReturn({
    code: 'foobar'
  });

  var subject = minify(uglify, logger)('build.min.js');
  var file = subject(testFile);

  td.verify(logger.warn('gulp-uglify expects an object, non-object provided'));

  assert.ok(file instanceof Vinyl);
  assert.ok(Buffer.isBuffer(file.contents));
  assert.equal(String(file.contents), 'foobar');

  td.reset();
  t.end();
});

function createTestFile(input) {
  return new Vinyl({
    cwd: '/home/terin/broken-promises/',
    base: '/home/terin/broken-promises/test',
    path: '/home/terin/broken-promises/test/test1.js',
    contents: Buffer.from(input)
  });
}
