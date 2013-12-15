[![Build Status](https://travis-ci.org/terinjokes/gulp-uglify.png?branch=master)](https://travis-ci.org/terinjokes/gulp-uglify)

## Information

<table>
<tr>
<td>Package</td><td>gulp-uglify</td>
</tr>
<tr>
<td>Description</td>
<td>Minify files with <a href="https://github.com/mishoo/UglifyJS2">UglifyJS2.</a></td>
</tr>
<tr>
<td>Node Version</td>
<td>≥ 0.8</td>
</tr>
</table>

## Usage

```javascript
var uglify = require('gulp-uglify');

gulp.task('minify', function() {
  var opt = {
    mangle: true,
    warnings: true
  };

  gulp.src('./lib/*.js')
    .pipe(uglify(opt))
    .pipe(gulp.dest('./dist/'))
});
```
## Behind the Scenes 

This plugin uses the pattern `uglify.minify(sourceString, {fromString: true}).code` to extract and pipe minified javascript files. You are free to pass `gulp-uglify` extra options--it will simply append the field `fromString: true` to your object prior to passing it to `uglify.minify(...)`. 

## Options

>- `warnings` (default `false`) — pass `true` to display compressor warnings.

>- `mangle` — pass `false` to skip mangling names.

>- `output` (default `null`) — pass an object if you wish to specify
  additional [output options](http://lisperator.net/uglifyjs/codegen).  The defaults are optimized
  for best compression.

>- `compress` (default `{}`) — pass `false` to skip compressing entirely.
  Pass an object to specify custom [compressor options](http://lisperator.net/uglifyjs/compress).


Source: [UglifyJS2's API-Reference](https://github.com/mishoo/UglifyJS2#api-reference), see for an more complete explanation.

## Source Maps

### Options

>- `outSourceMap` — used to set the file attribute in the source map.

>- `inSourceMap` — if you are compressing compiled JavaScript and have a source map for it. This option is only used if you also request `outSourceMap`.

>- `sourceRoot` — used to set the source root attribute in the source map.


Unlike the default `uglify-js` behavior, `gulp-uglify` will write the source map to the location specified in the `outSourceMap` request. 

#### Warning
If `gulp-uglify` is called multiple times, it will write out each different map to the same file, specified in `outSourceMap`. To avoid this, use the glob pattern below.

#### Dynamically Named Source Maps

If you use the string `*.js.map` as the suffix to your location, `gulp-uglify` will carry on in the same idiomatic way of `gulp`, and produce dynamically named source maps. Be warned, however, that this is not a true wildcard, moving the asterisk around will not work.

Thus, the example below will uglify all of the javascript files in `./lib/`, write the results to the directory `./dist/`, and place each source mapping in `./production/js/map/`.

```javascript
var uglify = require('gulp-uglify');

gulp.task('minify', function() {
  gulp.src('./lib/*.js')
    .pipe(uglify({ outSourceMap: 'production/js/map/*.js.map' }))
    .pipe(gulp.dest('./dist/'))
});
```
## LICENSE

(MIT License)

> Copyright (c) 2013 Terin Stock (<terinjokes@gmail.com>), Jonathan Pollack (<jonathanepollack@gmail.com>), Cloudlabs Inc.
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