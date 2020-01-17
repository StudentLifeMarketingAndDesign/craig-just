'use strict';

import path from 'path';
import gulp from 'gulp';
import del from 'del';
import browserSync from 'browser-sync';
// import swPrecache from 'sw-precache';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import gulpLoadPlugins from 'gulp-load-plugins';


// import {output as pagespeed} from 'psi';
import pkg from './package.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const themeDir = './themes/craigjust';


// Lint JavaScript
function lint(){
  return gulp.src(themeDir + '/scripts/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failOnError()));
}


// Optimize images
function images(){
  return gulp.src(themeDir + '/src/images/**/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(themeDir + '/dist/images'))
    .pipe($.size({title: themeDir + '/dist/images'}));
}


// Copy all files at the root level (app)
function copy(){

  return gulp.src([
       themeDir + '/src/*',
       themeDir + '/src/**/*',
       '!' + themeDir + '/src/styles/**/*',
       '!' + themeDir + '/src/scripts/**/*',
       '!' + themeDir + '/src/templates',
       '!' + themeDir + '/src/templates/**/*',
       '!' + themeDir + '/*.html',
     ],{dot: true})
    .pipe(gulp.dest(themeDir + '/dist/'))
    .pipe($.size({title: 'copy'}));
}

// Compile and automatically prefix stylesheets
function styles(){

    const AUTOPREFIXER_BROWSERS = [
      'ie >= 10',
      'ie_mob >= 10',
      'ff >= 30',
      'chrome >= 34',
      'safari >= 7',
      'opera >= 23',
      'ios >= 7',
      'android >= 4.4',
      'bb >= 10'
    ];

    var plugins = [
        autoprefixer({
          overrideBrowserslist: AUTOPREFIXER_BROWSERS
        }),
        cssnano()
    ];


  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    themeDir + '/src/styles/main.scss',
  ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10,
      includePaths: [
        themeDir + '/src/bower_components/foundation/scss/',
        './vendor/md/uiowa-bar/scss',
        './node_modules/'

      ]
    }).on('error', $.sass.logError))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.postcss(plugins)))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(themeDir + '/dist/styles'));
};

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enable ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
function scripts(){
    return gulp.src([
      // Note: Since we are not using useref in the scripts build pipeline,
      //       you need to explicitly list your scripts here in the right order
      //       to be correctly concatenated
      './node_modules/jquery/dist/jquery.js',
      './node_modules/popper.js/dist/umd/popper.min.js',
      './node_modules/tether/dist/js/tether.min.js',
      './node_modules/bootstrap/dist/js/bootstrap.min.js',
      './node_modules/@fortawesome/fontawesome-free/js/regular.js',
      './node_modules/lazysizes/lazysizes.js',
      './node_modules/flickity/dist/flickity.pkgd.js',
      './node_modules/magnific-popup/dist/jquery.magnific-popup.js',
      themeDir + '/src/scripts/app.js',

    ])
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.concat('main.min.js'))
      .pipe($.uglify())
      // Output files
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(themeDir + '/dist/scripts'));
};


// Clean output directory
function clean(){
  return del(['.tmp', themeDir + '/dist/*', '!dist/.git'], {dot: true})
}

function watch(){
  // gulp.watch([themeDir + '/**/*.html'], reload);
  // gulp.watch([themeDir + '/src/templates/**/*.ss'], gulp.series(html));
  gulp.watch([themeDir + '/src/styles/**/*.{scss,css}'], gulp.series(styles));
  gulp.watch([themeDir + '/src/scripts/**/*.js'], gulp.series(lint, scripts));
  gulp.watch([themeDir + '/src/images/**/*'], gulp.series(images));
}

// });

// Build production files, the default task
gulp.task('default', gulp.series(clean, copy, gulp.parallel(styles,
    lint, scripts, images,), watch));