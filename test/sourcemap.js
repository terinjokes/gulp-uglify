'use strict';
var mocha = require('mocha');
var assert = require('assert');
var Vinyl = require('vinyl');
var SourceListMap = require('source-list-map').SourceListMap;
var fromStringWithSourceMap = require('source-list-map')
  .fromStringWithSourceMap;
var td = require('testdouble');
var minify = require('../lib/minify');

var describe = mocha.describe;
var it = mocha.it;

describe('init-ed source maps', function() {
  it('should merge into full source map', function() {
    var testContents1Input =
      '(function(first, second) {\n    console.log(first + second);\n}(5, 10));\n';
    var testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test1.js',
      contents: new Buffer(testContents1Input)
    });

    var originalMap = new SourceListMap();
    originalMap.add(testContents1Input, 'test1.js', testContents1Input);
    testFile.sourceMap = originalMap.toStringWithSourceMap({
      file: 'test1.js'
    }).map;

    var outMap = fromStringWithSourceMap(
      'foobar',
      testFile.sourceMap
    ).toStringWithSourceMap({file: 'test1.js'});

    var uglify = td.object(['minify']);
    var logger = td.object(['logger']);

    td.when(
      uglify.minify(
        {
          'test1.js': testContents1Input
        },
        {
          output: {},
          sourceMap: {
            filename: 'test1.js',
            includeSources: true,
            content: testFile.sourceMap
          }
        }
      )
    ).thenReturn({
      code: 'foobar',
      map: JSON.stringify(outMap.map)
    });

    var subject = minify(uglify, logger)({});
    var file = subject(testFile);

    assert.ok(file instanceof Vinyl);
    assert.ok(Buffer.isBuffer(file.contents), 'file contents are a buffer');

    assert.equal(String(file.contents), 'foobar');

    assert.ok(file.sourceMap, 'has a source map');
    assert.equal(file.sourceMap.version, 3, 'source map has expected version');
    assert.ok(
      Array.isArray(file.sourceMap.sources),
      'source map has sources array'
    );
    assert.ok(
      Array.isArray(file.sourceMap.names),
      'source maps has names array'
    );
    assert.ok(file.sourceMap.mappings, 'source map has mappings');
  });

  it('should merge concated source maps', function() {
    var inMap = new SourceListMap();
    inMap.add('foo\n', 'foo.js', 'foo\n');
    inMap.add('bar\n', 'bar.js', 'bar\n');

    var testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test1.js',
      contents: new Buffer(String(inMap))
    });
    testFile.sourceMap = inMap.toStringWithSourceMap({file: 'test1.js'}).map;

    var outMap = new SourceListMap();
    outMap.add(' ', 'foo.js', 'foo\n');
    outMap.add(' ', 'bar.js', 'bar\n');
    outMap = outMap.toStringWithSourceMap({file: 'test1.js'});

    var uglify = td.object(['minify']);
    var logger = td.object(['warn']);

    td.when(
      uglify.minify(
        {
          'test1.js': String(inMap)
        },
        {
          output: {},
          sourceMap: {
            filename: 'test1.js',
            includeSources: true,
            content: testFile.sourceMap
          }
        }
      )
    ).thenReturn({
      code: 'send a PR changing this to the best La Croix flavor',
      map: JSON.stringify(outMap.map)
    });

    var subject = minify(uglify, logger)({});
    var file = subject(testFile);

    assert.ok(file instanceof Vinyl);
    assert.ok(Buffer.isBuffer(file.contents), 'file contents are a buffer');
    assert.equal(
      String(file.contents),
      'send a PR changing this to the best La Croix flavor'
    );

    assert.ok(file.sourceMap, 'has a source map');
    assert.equal(file.sourceMap.version, 3, 'source map has expected version');
    assert.ok(
      Array.isArray(file.sourceMap.sources),
      'source map has sources array'
    );
    assert.deepEqual(
      file.sourceMap.sources,
      ['foo.js', 'bar.js'],
      'sources array has the inputs'
    );
    assert.ok(
      Array.isArray(file.sourceMap.names),
      'source maps has names array'
    );
    assert.ok(file.sourceMap.mappings, 'source map has mappings');
  });
});
