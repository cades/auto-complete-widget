var gulp = require('gulp'),
    replace = require('gulp-replace'),
    wrap = require('gulp-wrap'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    CleanCSS = require('clean-css'),
    fs = require('fs');

function cssString(){
  return new CleanCSS().minify(
    fs.readFileSync('src/ac-widget.css', 'utf8')
  );
}

gulp.task('default', function(){
  return gulp.src('src/auto-complete.js')
    .pipe(replace('{inject css here}', cssString))
    .pipe(gulp.dest('test/'))
    .pipe(wrap({ src: 'src/wrap.template' }))
    .pipe(gulp.dest('dist/'))
    .pipe(uglify())
    .pipe(rename('auto-complete.min.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function(){
  gulp.watch(['src/auto-complete.js', 'src/wrap.template'], ['default']);
});
