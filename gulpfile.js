// Requirements
var gulp         = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat       = require('gulp-concat');
var data         = require('gulp-data');
var fs           = require('fs');
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
  return gulp.src('./dev/img/**/*')
    // .pipe((imageMin({ progressive: true, interlaced: true })))
    .pipe(gulp.dest('./dist/img/'))
});

// Favicon
gulp.task('favicon', function () {
  return gulp.src('./dev/img/**/favicon.ico')
    .pipe((imageMin({ progressive: true, interlaced: true })))
    .pipe(gulp.dest('./dist'))
});

// Font
gulp.task('font', function () {
  return gulp.src('./dev/font/*')
    .pipe(gulp.dest('./dist/font/'))
});

// SCSS
gulp.task('scss', function() {
  gulp.src('./dev/scss/style.scss')
  .pipe(sourcemaps.init())
  .pipe(scss({outputStyle: 'compressed'}).on('error', scss.logError))
  .pipe(autoprefixer({ browsers: [ 'last 2 versions' ] }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./dist/css/'))
  .pipe(browserSync.stream())
});

// Minify JS
gulp.task('javascript', function() {
  return gulp.src([
    './dev/js/scripts.js'])
    .pipe(plumber())
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'))
});

// Compile PUG, English
gulp.task('viewEN', function() {
  gulp.src('./dev/pug/**/*.pug')
    .pipe(plumber())
    .pipe(data(function() {
      return JSON.parse(fs.readFileSync('./dev/lang/en.json'));
    }))
    .pipe(pug())
    .pipe(gulp.dest('./dist/en/'));
});

// Compile PUG, Chinese
gulp.task('viewCN', function() {
  gulp.src('./dev/pug/**/*.pug')
    .pipe(plumber())
    .pipe(data(function() {
      return JSON.parse(fs.readFileSync('./dev/lang/cn.json'));
    }))
    .pipe(pug())
    .pipe(gulp.dest('./dist/cn/'));
});

// Browser Sync Dev
gulp.task('browserSync', function() {
  browserSync.init({
    notify: false,
    port: 8080,
    ghostMode: false,
    server: {
      baseDir: 'dist',
      index: '/en/index.html'
    }
  });

  var reloadBrowser = function() {
    browserSync.reload();
  };

  gulp.watch(['./dev/pug/**/*.pug', './dev/lang/*.json']).on('change', function() {
    runSequence('viewEN', 'viewCN');
  });

  gulp.watch(['./dist/**/*.html']).on('change', reloadBrowser);

  gulp.watch(['./dev/img/*'], function() {
    runSequence('images', reloadBrowser);
  });

   gulp.watch(['./dev/font/*'], function() {
    runSequence('font', reloadBrowser);
  });

  gulp.watch(['./dev/scss/**/*.scss'], ['scss']);

  gulp.watch(['./dev/js/**/*.js'], function() {
    runSequence('javascript', reloadBrowser);
  });
});

// Defaullt, comple

gulp.task('default', function(done) {
  runSequence('scss', 'viewEN', 'viewCN', 'javascript', 'images', 'favicon', 'font');
});

// Serve Dev

gulp.task('serve', function(done) {
  runSequence('scss', 'viewEN', 'viewCN', 'javascript', 'images', 'favicon', 'font', 'browserSync', function() {
  });
});