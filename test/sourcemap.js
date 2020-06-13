'use strict';
var test = require('tape-catch');
var assert = require('assert');
var Buffer = require('safe-buffer').Buffer;
var Vinyl = require('vinyl');
var SourceListMap = require('source-list-map').SourceListMap;
var td = require('testdouble');
var minify = require('../lib/minify');
// Use actual UglifyJS so we are validating that the final sourcemap is indeed merged
var uglify = require('uglify-js');

test('sourcemaps should be merged', function(t) {
  // Output of babel on 'let [a,b] = [1,2]`
  var testContents1PreviousMap = {
    version: 3,
    file: 'test1.js',
    sources: ['test1.js'],
    sourcesContent: ['let [a,b] = [1,2];\n'],
    names: ['a', 'b'],
    mappings: ';;IAAKA,C,GAAQ,C;IAANC,C,GAAQ,C'
  };
  var testContents1Input = '"use strict";\n\nvar a = 1,\n    b = 2;';
  var testFile = new Vinyl({
    cwd: '/home/terin/broken-promises/',
    base: '/home/terin/broken-promises/test',
    path: '/home/terin/broken-promises/test/test1.js',
    contents: Buffer.from(testContents1Input)
  });

  testFile.sourceMap = testContents1PreviousMap;

  var logger = td.object(['logger']);

  var subject = minify(uglify, logger)({});
  var file = subject(testFile);

  assert.ok(file instanceof Vinyl);
  assert.ok(Buffer.isBuffer(file.contents), 'file contents are a buffer');

  assert.equal(String(file.contents), '"use strict";var a=1,b=2;');

  assert.ok(file.sourceMap, 'has a source map');
  assert.equal(file.sourceMap.version, 3, 'source map has expected version');
  assert.ok(
    Array.isArray(file.sourceMap.sources),
    'source map has sources array'
  );
  assert.ok(Array.isArray(file.sourceMap.names), 'source maps has names array');
  assert.ok(file.sourceMap.mappings, 'source map has mappings');
  // Note: All mappings are from a single line
  // Expected output:
  // http://sokra.github.io/source-map-visualization/#base64,InVzZSBzdHJpY3QiO3ZhciBhPTEsYj0yOw==,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50L2FwcC5qcyIsInNvdXJjZXMiOlsiY2xpZW50L2FwcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgW2EsYl0gPSBbMSwyXTtcbiJdLCJuYW1lcyI6WyJhIiwiYiJdLCJtYXBwaW5ncyI6ImlCQUFLQSxFQUFRLEVBQU5DLEVBQVEifQ==,bGV0IFthLGJdID0gWzEsMl07Cg==
  assert.equal(file.sourceMap.mappings, 'iBAAKA,EAAQ,EAANC,EAAQ');
  td.reset();
  t.end();
});

test('sourcemaps should merge when concatted', function(t) {
  var inMap = new SourceListMap();
  inMap.add('var foo=1;\n', 'foo.js', 'var foo=1;\n');
  inMap.add('var bar=1;\n', 'bar.js', 'var bar=1;\n');

  var testFile = new Vinyl({
    cwd: '/home/terin/broken-promises/',
    base: '/home/terin/broken-promises/test',
    path: '/home/terin/broken-promises/test/test1.js',
    contents: Buffer.from(String(inMap))
  });
  testFile.sourceMap = inMap.toStringWithSourceMap({file: 'test1.js'}).map;

  var logger = td.object(['warn']);

  var subject = minify(uglify, logger)({});
  var file = subject(testFile);

  assert.ok(file instanceof Vinyl);
  assert.ok(Buffer.isBuffer(file.contents), 'file contents are a buffer');
  assert.equal(String(file.contents), 'var foo=1,bar=1;');

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
  assert.ok(Array.isArray(file.sourceMap.names), 'source maps has names array');
  assert.ok(file.sourceMap.mappings, 'source map has mappings');
  // Expected output:
  // http://sokra.github.io/source-map-visualization/#base64,dmFyIGZvbz0xLGJhcj0xOw==,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdDEuanMiLCJzb3VyY2VzIjpbImZvby5qcyIsImJhci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZm9vPTE7XG4iLCJ2YXIgYmFyPTE7XG4iXSwibmFtZXMiOlsiZm9vIiwiYmFyIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFBQSxJQUFBLEVDQUFDLElBQUEifQ==,dmFyIGZvbz0xOwo=,dmFyIGJhcj0xOwo=
  assert.equal(file.sourceMap.mappings, 'AAAA,IAAAA,IAAA,ECAAC,IAAA');
  td.reset();
  t.end();
});
