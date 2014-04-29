'use strict';
var test = require('tape'),
    gulpUglify = require('../');

test('should not alter given options object', function(t) {
  t.plan(1);

  var myOptionsObject = {
    fromString: true
  };
  gulpUglify(myOptionsObject);

  t.deepEqual(myOptionsObject, {
    fromString: true
  });
});
