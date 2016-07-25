'use strict';
var mocha = require('mocha');
var assert = require('power-assert');
var Vinyl = require('vinyl');
var uglifyjs = require('uglify-js');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var mississippi = require('mississippi');
var gulpUglify = require('../');

var pipe = mississippi.pipe;
var to = mississippi.to;
var from = mississippi.from;

var describe = mocha.describe;
var it = mocha.it;
var beforeEach = mocha.beforeEach;

describe('source maps', function () {
  var testContents1Input = '(function(first, second) {\n    console.log(first + second);\n}(5, 10));\n';
  var testContents1Expected = uglifyjs.minify(testContents1Input, {fromString: true}).code;
  var testContents2Input = '(function(alert) {\n    alert(5);\n}(alert));\n';
  var testContents2Expected = uglifyjs.minify(testContents2Input, {fromString: true}).code;
  var testConcatExpected = uglifyjs.minify(testContents1Input + '\n' + testContents2Input, {fromString: true}).code;

  beforeEach(function () {
    this.testFile1 = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test1.js',
      contents: new Buffer(testContents1Input)
    });

    this.testFile2 = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test2.js',
      contents: new Buffer(testContents2Input)
    });
  });

  describe('init-ed source maps', function () {
    it('should merge into full source map', function (done) {
      pipe([
        from.obj([this.testFile1]),
        sourcemaps.init(),
        gulpUglify(),
        to.obj(function (newFile, enc, next) {
          assert.ok(newFile, 'emits a file');
          assert.ok(newFile.path, 'file has a path');
          assert.ok(newFile.relative, 'file has relative path information');
          assert.ok(newFile.contents, 'file has contents');

          assert.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

          assert.equal(String(newFile.contents), testContents1Expected);

          assert.ok(newFile.sourceMap, 'has a source map');
          assert.equal(newFile.sourceMap.version, 3, 'source map has expected version');
          assert.ok(Array.isArray(newFile.sourceMap.sources), 'source map has sources array');
          assert.ok(Array.isArray(newFile.sourceMap.names), 'source maps has names array');
          assert.ok(newFile.sourceMap.mappings, 'source map has mappings');
          next();
        })
      ], done);
    });

    it('should merge concated source maps', function (done) {
      pipe([
        from.obj([this.testFile1, this.testFile2]),
        sourcemaps.init(),
        concat('all.js'),
        gulpUglify(),
        to.obj(function (newFile, enc, next) {
          assert.ok(newFile, 'emits a file');
          assert.ok(newFile.path, 'file has a path');
          assert.ok(newFile.relative, 'file has relative path information');
          assert.ok(newFile.contents, 'file has contents');

          assert.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

          assert.equal(String(newFile.contents), testConcatExpected);

          assert.ok(newFile.sourceMap, 'has a source map');
          assert.equal(newFile.sourceMap.version, 3, 'source map has expected version');
          assert.ok(Array.isArray(newFile.sourceMap.sources), 'source map has sources array');
          assert.deepEqual(newFile.sourceMap.sources, ['test1.js', 'test2.js'], 'sources array has the inputs');
          assert.ok(Array.isArray(newFile.sourceMap.names), 'source maps has names array');
          assert.ok(newFile.sourceMap.mappings, 'source map has mappings');
          next();
        })
      ], done);
    });
  });

  it('should not remember source maps across files', function (done) {
    this.testFile1.sourceMap = {
      version: 3,
      file: 'test1.js',
      sourceRoot: '',
      sources: ['test1.ts'],
      sourcesContent: ['(function(first, second) { console.log(first + second) }(5, 10))'],
      names: [],
      mappings: 'AAAA,CAAC,UAAS,KAAK,EAAE,MAAM;IAAI,OAAO,CAAC,GAAG,CAAC,KAAK,GAAG,MAAM,CAAC;AAAC,CAAC,CAAC,CAAC,EAAE,EAAE,CAAC,CAAC'
    };
    var testFile1SourcesContent = [].slice.call(this.testFile1.sourceMap.sourcesContent);

    this.testFile2.sourceMap = {
      version: 3,
      file: 'test2.js',
      sourceRoot: '',
      sources: ['test2.ts'],
      sourcesContent: ['(function(alert) { alert(5); }(alert))'],
      names: [],
      mappings: 'AAAA,CAAC,UAAS,KAAK;IAAI,KAAK,CAAC,CAAC,CAAC;AAAE,CAAC,CAAC,KAAK,CAAC,CAAC'
    };
    var testFile2SourcesContent = [].slice.call(this.testFile2.sourceMap.sourcesContent);

    pipe([
      from.obj([this.testFile1, this.testFile2]),
      gulpUglify(),
      to.obj(function (newFile, enc, next) {
        assert.ok(newFile, 'emits a file');
        assert.ok(newFile.path, 'file has a path');
        assert.ok(newFile.relative, 'file has relative path information');
        assert.ok(newFile.contents, 'file has contents');

        assert.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

        if (/test1\.js/.test(newFile.path)) {
          assert.equal(String(newFile.contents), testContents1Expected);
          assert.deepEqual(newFile.sourceMap.sources, ['test1.ts']);
          assert.deepEqual(testFile1SourcesContent, newFile.sourceMap.sourcesContent);
        } else if (/test2\.js/.test(newFile.path)) {
          assert.equal(String(newFile.contents), testContents2Expected);
          assert.deepEqual(newFile.sourceMap.sources, ['test2.ts']);
          assert.deepEqual(testFile2SourcesContent, newFile.sourceMap.sourcesContent);
        }

        assert.ok(newFile.sourceMap, 'has a source map');
        assert.equal(newFile.sourceMap.version, 3, 'source map has expected version');
        assert.ok(Array.isArray(newFile.sourceMap.sources), 'source map has sources array');
        assert.ok(Array.isArray(newFile.sourceMap.names), 'source maps has names array');
        assert.ok(newFile.sourceMap.mappings, 'source map has mappings');
        next();
      })
    ], done);
  });

  it('should avoid "ghost" files in sourcemaps', function (done) {
    var testBabelInput = '"use strict";\n\n(function (first, second) {\n    console.log(first + second);\n})(5, 10);';
    var testBabelExpected = uglifyjs.minify(testBabelInput, {fromString: true}).code;

    var testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/all.js',
      contents: new Buffer(testBabelInput)
    });
    testFile.sourceMap = {
      version: 3,
      file: 'all.js',
      sources: ['test1.js'],
      names: [],
      mappings: ';;AAAA,AAAC,CAAA,UAAS,KAAK,EAAE,MAAM,EAAE;AACrB,WAAO,CAAC,GAAG,CAAC,KAAK,GAAG,MAAM,CAAC,CAAC;CAC/B,CAAA,CAAC,CAAC,EAAE,EAAE,CAAC,CAAE',
      sourcesContent: [testContents1Input]
    };

    pipe([
      from.obj([testFile]),
      gulpUglify(),
      to.obj(function (newFile, enc, next) {
        assert.ok(newFile, 'emits a file');
        assert.ok(newFile.path, 'file has a path');
        assert.ok(newFile.relative, 'file has relative path information');
        assert.ok(newFile.contents, 'file has contents');

        assert.ok(newFile.contents instanceof Buffer, 'file contents are a buffer');

        assert.equal(String(newFile.contents), testBabelExpected);

        assert.ok(newFile.sourceMap, 'has a source map');
        assert.equal(newFile.sourceMap.version, 3, 'source map has expected version');
        assert.ok(Array.isArray(newFile.sourceMap.sources), 'source map has sources array');
        assert.deepEqual(newFile.sourceMap.sources, ['test1.js'], 'sources array has the inputs');
        assert.ok(Array.isArray(newFile.sourceMap.names), 'source maps has names array');
        assert.ok(newFile.sourceMap.mappings, 'source map has mappings');
        assert.ok(Array.isArray(newFile.sourceMap.sourcesContent), 'source maps has sources content array');
        assert.deepEqual(newFile.sourceMap.sourcesContent, [testContents1Input], 'sources array has the inputs');
        next();
      })
    ], done);
  });
});
