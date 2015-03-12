# gulp-uglify [![Build Status](http://img.shields.io/travis/terinjokes/gulp-uglify.svg?style=flat)](https://travis-ci.org/terinjokes/gulp-uglify) [![](http://img.shields.io/npm/dm/gulp-uglify.svg?style=flat)](https://www.npmjs.org/package/gulp-uglify) [![](http://img.shields.io/npm/v/gulp-uglify.svg?style=flat)](https://www.npmjs.org/package/gulp-uglify) [![](http://img.shields.io/codeclimate/github/terinjokes/gulp-uglify.svg?style=flat)](https://codeclimate.com/github/terinjokes/gulp-uglify) [![](http://img.shields.io/codeclimate/coverage/github/terinjokes/gulp-uglify.svg?style=flat)](https://codeclimate.com/github/terinjokes/gulp-uglify)

> Minify JavaScript with UglifyJS2.

## Installation

Install package with NPM and add it to your development dependencies:

`npm install --save-dev gulp-uglify`

## Usage

```javascript
var uglify = require('gulp-uglify');

gulp.task('compress', function() {
  return gulp.src('lib/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});
```

## Options

- `mangle`

	Pass `false` to skip mangling names.

- `output`

	Pass an object if you wish to specify additional [output
	options](http://lisperator.net/uglifyjs/codegen). The defaults are
	optimized for best compression.

- `compress`

	Pass an object to specify custom [compressor
	options](http://lisperator.net/uglifyjs/compress). Pass `false` to skip
	compression completely.

- `preserveComments`

	A convenience option for `options.output.comments`. Defaults to preserving no
	comments.

	- `all`

		Preserve all comments in code blocks

	- `some`

		Preserve comments that start with a bang (`!`) or include a Closure
		Compiler directive (`@preserve`, `@license`, `@cc_on`)

	- `function`

		Specify your own comment preservation function. You will be passed the
		current node and the current comment and are expected to return either
		`true` or `false`.

- `quoteStyle`

	A convenience option for `options.output.quote_style`. Defaults to using
  single or double quotes such as to minimize the number of bytes.

	- `default` or `0`

    Use single or double quotes such as to minimize the number of bytes (prefers
    double quotes when both will do); this is the previous behavior.

	- `single` or `1`

    Always use single quotes

	- `double` or `2`

    Always use double quotes

  - `original` or `3`

    Always use the original quotes

You can also pass the `uglify` function any of the options [listed
here](https://github.com/mishoo/UglifyJS2#the-simple-way) to modify
UglifyJS's behavior.
