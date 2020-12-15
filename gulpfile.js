const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const csso = require("gulp-csso");
const autoprefixer = require("autoprefixer");
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const webp = require("gulp-webp");
const sync = require("browser-sync").create();
const svgstore = require("gulp-svgstore");
const imagemin = require("gulp-imagemin");

// clean

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

const stylesMin = () => {
  return gulp
    .src("build/css/style.css")
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
};

exports.styles = gulp.series(styles, stylesMin);

// HTML

const html = () => {
  return gulp
    .src("source/*.html")
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("build"));
};

exports.html = html;

// copy files

const copy = () => {
  return gulp
    .src(["source/fonts/**/*", "source/img/**/*"], {
      base: "source",
    })
    .pipe(gulp.dest("build"))
    .pipe(
      sync.stream({
        once: true,
      })
    );
};

exports.copy = copy;

// images

const images = () => {
  return gulp
    .src("source/img/**/*.{jpg, png, svg}")
    .pipe(imagemin())
    .pipe(gulp.dest("build/img"));
};
exports.images = images;

// webp

const webpCopy = () => {
  return gulp
    .src("source/img/**/*.{jpg, png}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("build/img"));
};

exports.webpCopy = webpCopy;

// svg sprite

const sprite = () => {
  return gulp
    .src("source/icons/*.svg")
    .pipe(
      imagemin([
        imagemin.svgo({
          plugins: [{
            removeViewBox: true
          }, {
            cleanupIDs: false
          }],
        }),
      ])
    )
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
};

exports.sprite = sprite;

//  JavaScript

const scripts = () => {
  return gulp.src("source/js/*.js")
    .pipe(gulp.dest("build/js"));
};

exports.scripts = scripts;

// Build

exports.build = gulp.series(
  clean,
  gulp.parallel(
    html,
    gulp.series(styles, stylesMin),
    scripts,
    copy,
    images,
    webpCopy,
    sprite
  )
);

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series("html"));
  gulp.watch("source/**/*.js", gulp.series("scripts"));
  gulp.watch(
    "source/img/**/*.{jpg, png, svg}",
    gulp.series("images", "webpCopy")
  );
  gulp.watch("source/icons/*.svg", gulp.series("sprite"));
  gulp.watch("source/**/*.{html, js, jpg, png, svg}").on("change", sync.reload);
};
exports.watcher = watcher;

exports.default = gulp.series(
  clean,
  gulp.parallel(html, scripts, copy, images, webpCopy, sprite),
  styles,
  stylesMin,
  server,
  watcher
);
