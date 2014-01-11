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
<td>≥ 0.6</td>
</tr>
</table>

## Usage

```javascript
var uglify = require('gulp-uglify');

gulp.task('compress', function() {
  gulp.src('lib/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
});
```
You can also pass the `uglify` function any of the options [listed here](https://github.com/mishoo/UglifyJS2#the-simple-way) to modify uglify's behavior.

## Custom Options

### preserveComments
Type: `Boolean`, `String`, `Function`
Default: `undefined`
Options: `true` `'all'` `'some'`

Turn on preservation of comments. (*Will be parsed to options.output.comments*)
(Credits to [grunt-contrib-uglify](https://github.com/gruntjs/grunt-contrib-uglify))

- `true` || `'all'` will preserve all comments in code blocks that have not been squashed or dropped
- `'some'` will preserve all comments that start with a bang (`!`) or include a closure compiler style directive (`@preserve` `@license` `@cc_on`)
- `function` specify your own comment preservation function. You will be passed the current node and the current comment and are expected to return either `true` or `false`

## LICENSE

(MIT License)

> Copyright (c) 2013 Terin Stock <terinjokes@gmail.com>
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
