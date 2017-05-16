'use strict';
var through = require('through2');
var applySourceMap = require('vinyl-sourcemaps-apply');
var isObject = require('lodash/fp/isObject');
var defaultsDeep = require('lodash/fp/defaultsDeep');
var log = require('./lib/log');
var createError = require('./lib/create-error');

var defaultOptions = defaultsDeep({
  output: {}
});

function setup(opts) {
  if (opts && !isObject(opts)) {
    log.warn('gulp-uglify expects an object, non-object provided');
    opts = {};
  }

  var options = defaultOptions(opts);

  return options;
}

module.exports = function(opts, uglify) {
  function minify(file, encoding, callback) {
    var options = setup(opts || {});

    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(createError(file, 'Streaming not supported', null));
    }

    if (file.sourceMap) {
      options.sourceMap = {
        filename: file.sourceMap.file,
        includeSources: true
      };

      // UglifyJS generates broken source maps if the input source map
      // does not contain mappings.
      if (file.sourceMap.mappings) {
        options.sourceMap.content = file.sourceMap;
      }
    }

    var fileMap = {};
    fileMap[file.relative] = String(file.contents);

    var mangled = uglify.minify(fileMap, options);

    if (mangled.error) {
      return callback(
        createError(file, 'unable to minify JavaScript', mangled.error)
      );
    }

    file.contents = new Buffer(mangled.code);

    if (file.sourceMap) {
      var sourceMap = JSON.parse(mangled.map);
      applySourceMap(file, sourceMap);
    }

    callback(null, file);
  }

  return through.obj(minify);
};
