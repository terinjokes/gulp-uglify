'use strict';

var test = require('tape'),
    Vinyl = require('vinyl'),
    cacheStub = {},
    proxyquire = require('proxyquire'),
    gulpUglify = proxyquire('../', {
      'memory-cache': cacheStub
    }),
    uglifyjs = require('uglify-js');

var testContentsInput = '"use strict"; (function(console, first, second) { console.log(first + second) }(5, 10))';

var min = uglifyjs.minify(testContentsInput, {fromString: true});
var testContentsExpected = min.code;
var testMapExpected = min.map;

var testFile = function(path) {
  return new Vinyl({
    cwd: "/home/terin/broken-promises/",
    base: "/home/terin/broken-promises/test",
    path: path || "/home/terin/broken-promises/test/test1.js",
    contents: new Buffer(testContentsInput)
  });
};

test('should not cache by default', function(t) {
  t.plan(1);

  var stream = gulpUglify();
  stream.on('data', function() {
    t.equal(cacheStub.size(), 0);
  });

  stream.write(testFile());
});

test('should cache if option is switched on', function(t) {
  t.plan(2);

  var options = {
    cache: true
  };
  var file = testFile();
  var stream = gulpUglify(options);

  stream.on('data', function() {
    t.equal(cacheStub.size(), 1);

    t.deepEqual(cacheStub.get(file.path), {
      raw: testContentsInput,
      mangled: testContentsExpected,
      map: testMapExpected,
      options: options
    });
  });

  stream.write(file);
});


test('should cache if option is switched on', function(t) {
  t.plan(2);

  cacheStub.clear();
  cacheStub.debug(true);

  var options = {
    cache: true
  };
  var stream = gulpUglify(options);

  stream.on('data', function() {
    t.equal(cacheStub.size(), 1, 'There should be one file in the cache');
  });

  var file1 = testFile();
  stream.write(file1);
  stream.write(file1);
});
