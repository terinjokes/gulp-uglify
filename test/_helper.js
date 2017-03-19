'use strict';
var td = require('testdouble');
var mocha = require('mocha');

mocha.afterEach(function() {
  td.reset();
});
