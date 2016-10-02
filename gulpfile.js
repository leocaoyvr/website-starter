// Requirements
var gulp         = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat       = require('gulp-concat');
var imageMin     = require('gulp-imagemin');
var plumber      = require('gulp-plumber');
var pug          = require('gulp-pug');
var scss         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');
var browserSync  = require('browser-sync');
var runSequence  = require('run-sequence');

// Optimize images
gulp.task('images', function () {
  return gulp.src('./dev/img/*')
    .pipe((imageMin({ progressive: true, interlaced: true })))
    .pipe(gulp.dest('./dist/img/'))
});

// SCSS
gulp.task('scss', function() {
  gulp.src('./dev/scss/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(scss({outputStyle: 'compressed'}).on('error', scss.logError))
  .pipe(autoprefixer({ browsers: [ 'last 2 versions' ] }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./dist/css/'))
  .pipe(browserSync.stream())
});

// Minify JS
gulp.task('javascript', function() {
  return gulp.src(['./dev/js/*.js'])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./dist/js/'))
});

// Compile pug
gulp.task('pug', function() {
  gulp.src('./dev/pug/**/*.pug')
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulp.dest('./dist'))
});

// Browser Sync Dev
gulp.task('browserSync', function() {
  browserSync.init({
    notify: false,
    port: 8080,
    ghostMode: false,
    server: {
      baseDir: ['dist']
    }
  });

  gulp.watch(['./dev/pug/**/*.pug'], ['pug']);
  gulp.watch(['./dev/scss/**/*.scss'], ['scss']);
  gulp.watch(['./dev/js/**/*.js'], ['javascript']);

  gulp.watch(['./dist/js/**/*.js']).on('change', browserSync.reload);
  gulp.watch(['./dist/html/**/*.html']).on('change', browserSync.reload);
});

// Defaullt, comple

gulp.task('default', function(done) {
  runSequence('scss', 'pug', 'javascript', 'images');
});

// Serve Dev

gulp.task('serve', function(done) {
  runSequence('scss', 'pug', 'javascript', 'browserSync', function() {
  });
});