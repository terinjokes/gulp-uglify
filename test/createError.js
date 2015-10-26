'use strict';
var test = require('tape');
var Vinyl = require('vinyl');
var createError = require('../lib/createError');

var testOkContentsInput = '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';
var testFile = new Vinyl({
  cwd: '/home/terin/broken-promises/',
  base: '/home/terin/broken-promises/test',
  path: '/home/terin/broken-promises/test/test2.js',
  contents: new Buffer(testOkContentsInput)
});

test('should report "unspecified error" if err has no msg or message properties', function (t) {
  t.plan(3);
  var e = createError(testFile, {});

  t.ok(e instanceof Error, 'argument should be of type error');
  t.equal(e.plugin, 'gulp-uglify', 'error is from gulp-uglify');
  t.true(e.message.match(/unspecified error$/), 'error should not be specified');
});
