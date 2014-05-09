# gulp-uglify changelog

## Development (

- Removed support for old style source maps
- Added support for gulp-sourcemap
- Updated tape development dependency
- Dropped support for Node 0.9

## 0.2.1

- Correct source map output
- Remove `gulp` dependency by using `vinyl` in testing
- Passthrough null files correctly
- Report error if attempting to use a stream-backed file

## 0.2.0

- Dropped support for Node versions less than 0.9
- Switched to using Streams2
- Add support for generating source maps
- Add option for preserving comments

## 0.2.2

- Added support for propagating uglify errors as gulp errors
