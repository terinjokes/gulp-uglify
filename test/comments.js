'use strict';
var mocha = require('mocha');
var assert = require('power-assert');
var Vinyl = require('vinyl');
var mississippi = require('mississippi');
var gulpUglify = require('../');

var describe = mocha.describe;
var it = mocha.it;
var beforeEach = mocha.beforeEach;

var pipe = mississippi.pipe;
var to = mississippi.to;
var from = mississippi.from;

describe('preserveComments option', function() {
  beforeEach(function() {
    this.testFile = new Vinyl({
      cwd: '/home/terin/broken-promises/',
      base: '/home/terin/broken-promises/test',
      path: '/home/terin/broken-promises/test/test1.js',
      contents: new Buffer(
        '"use strict";\nfunction foobar(){}\n/* comment one */\n/* comment three */\n/*! comment two MIT */\nfunction itsatrap(){}'
      )
    });
  });

  it('should preserve all comments', function(done) {
    pipe(
      [
        from.obj([this.testFile]),
        gulpUglify({preserveComments: 'all'}),
        to.obj(function(newFile, enc, next) {
          var contents = newFile.contents.toString();
          assert.ok(/one/.test(contents), 'has comment one');
          assert.ok(/two/.test(contents), 'has comment two');
          assert.ok(/three/.test(contents), 'has comment three');
          next();
        })
      ],
      done
    );
  });

  it('should preserve some comments', function(done) {
    pipe(
      [
        from.obj([this.testFile]),
        gulpUglify({preserveComments: 'some'}),
        to.obj(function(newFile, enc, next) {
          var contents = newFile.contents.toString();
          assert.ok(!/one/.test(contents), 'does not have comment one');
          assert.ok(/two/.test(contents), 'has comment two');
          assert.ok(!/three/.test(contents), 'does not have comment three');
          next();
        })
      ],
      done
    );
  });

  it('should preserve license comments', function(done) {
    pipe(
      [
        from.obj([this.testFile]),
        gulpUglify({preserveComments: 'license'}),
        to.obj(function(newFile, enc, next) {
          var contents = newFile.contents.toString();
          assert.ok(!/one/.test(contents), 'does not have comment one');
          assert.ok(/two/.test(contents), 'has comment two');
          assert.ok(!/three/.test(contents), 'does not have comment three');
          next();
        })
      ],
      done
    );
  });

  it('should preserve comments that fn returns true for', function(done) {
    pipe(
      [
        from.obj([this.testFile]),
        gulpUglify({
          preserveComments: function(node, comment) {
            return /three/.test(comment.value);
          }
        }),
        to.obj(function(newFile, enc, next) {
          var contents = newFile.contents.toString();
          assert.ok(!/one/.test(contents), 'does not have comment one');
          assert.ok(!/two/.test(contents), 'does not have comment two');
          assert.ok(/three/.test(contents), 'has comment three');
          next();
        })
      ],
      done
    );
  });
});
