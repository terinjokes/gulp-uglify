var es = require('event-stream'),
	  fs = require('fs'),
	  uglify = require('uglify-js'),
	  path = require('path'),
	  mkdirp = require('mkdirp'),
	  clone = require('clone');

module.exports = function(opt) {
  'use strict';

  if (!opt) {
    opt = {fromString: true};
  }

  if (!opt.fromString) {
    opt.fromString = true;
  }

  function minify(file, callback) {
    if (!opt.outSourceMap) {
      // No source maps
      try {
      	file.contents = new Buffer(uglify.minify(String(file.contents), opt).code);
      } catch (e) {}
      return callback(null, file);
    }

    if (opt.outSourceMap.match(/\*\.js\.map/)) {
      // The wildcard string '*.js.map' tells us to dynamically generate the map name
      var basePath = opt.outSourceMap.replace(/\*\.js\.map/, ''),
      	  mapName = file.relative.match(/.+\.js/)+'.map';
    } else {
      // No wildcard string, use the given opt.outSourceMap name.
      var match = opt.outSourceMap.match(/([^\/]+)/g),
      	  basePath = opt.outSourceMap.replace(match[match.length-1], ''),
      mapName = match[match.length-1];
    }

    // Don't overwrite global opt
    var opts = clone(opt);
    opts.outSourceMap = mapName;

    try {
    	var ugly = uglify.minify(String(file.contents), opts);
    	file.contents = new Buffer(ugly.code);

    	mkdirp(basePath, function(err){
	      if (err) return callback(err);
	      fs.writeFile(basePath + mapName, ugly.map, function(err){
	        if (err) return callback(err);
	        callback(null, file);
	      });
	    });
    } catch (e) {}
  }
  return es.map(minify);
};