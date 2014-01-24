[![Build Status](https://travis-ci.org/terinjokes/gulp-uglify.png?branch=master)](https://travis-ci.org/terinjokes/gulp-uglify)

## Information

<table>
<tr>
<td>Package</td><td>gulp-uglify</td>
</tr>
<tr>
<td>Description</td>
<td>Minify files with UglifyJS.</td>
</tr>
<tr>
<td>Node Version</td>
<td>≥ 0.9</td>
</tr>
</table>

## Usage

```javascript
var uglify = require('gulp-uglify');

gulp.task('compress', function() {
  gulp.src('lib/*.js')
    .pipe(uglify({outSourceMaps: true))
    .pipe(gulp.dest('dist'))
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

You can also pass the `uglify` function any of the options [listed
here](https://github.com/mishoo/UglifyJS2#the-simple-way) to modify
UglifyJS's behavior.


### Source Maps

You can have UglifyJS’s generated source maps emitted on the stream by passing
`true` for the `outSourceMap` option. The file object’s path will be based on
the input file’s, with ‘.map’ appended.

Input source maps are no supported by this plugin at this time.

## LICENSE

(MIT License)

> Copyright (c) 2013-2014 Terin Stock <terinjokes@gmail.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> "Software"), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
> LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
> OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
> WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
