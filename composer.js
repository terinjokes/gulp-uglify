'use strict';
var through = require('through2');
var minify = require('./lib/minify');

module.exports = function(uglify, logger) {
  return function(opts) {
    return through.obj(minify(uglify, logger)(opts));
  };
};
