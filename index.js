var es = require('event-stream'),
		uglify = require('uglify-js');

module.exports = function(opt) {
	'use strict';

	opt = opt || {};
	opt.fromString = true;

    //allow options of preserveComments
    if (opt.preserveComments) {
        opt.output = opt.output || {};
        if (opt.preserveComments === 'all' || opt.preserveComments === true){
            //preserve all comments
            opt.output.comments = true;
        }
        else if (opt.preserveComments === 'some') {
            // preserve comments with directives or that start with a bang (!)
            opt.output.comments = /^!|@preserve|@license|@cc_on/i;
        }
        else if (typeof opt.preserveComments === 'function') {
            //pass a function to output options
            opt.output.comments = opt.preserveComments;
        }
    }

	return es.map(function (file, callback) {
		try {
			file.contents = new Buffer(uglify.minify(String(file.contents), opt).code);
		} catch(e) {
			console.warn('Error caught from uglify: ' + e.message + '. Returning unminified code');
		}
		callback(null, file);
	});
};
