const gulp = require('gulp');
const rename = require("gulp-rename");
const ts = require('gulp-typescript');
const concat = require('gulp-concat');
const fs = require('fs');
const tsUniversal = require("ts-universal");
const sourcemaps = require('gulp-sourcemaps');
const runSequence = require('run-sequence');
const merge = require("merge2");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const replace = require("gulp-replace");
let project = ts.createProject('src/tsconfig.json');
let projectEs2015 = ts.createProject('src/tsconfig.json', {
    module: "es6",
    outDir: "dist/es6",
    outFile: undefined
});
let typingsProject = ts.createProject('src/tsconfig.json', {
    module: "system",
    outFile: null,
    outDir: "dist/"
});

gulp.task('watch', ['build'], function() {
    gulp.watch(['src/**/*.ts'], () => {
        runSequence('build');
    });
});


gulp.task('build', function() {
    let result = gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(project());
    return result.js.pipe(tsUniversal('build/', {
            name: 'wires-html-parser',
            expose: 'index',
        }))
        .pipe(rename('build.js'))
        .pipe(gulp.dest('build/'));
});

gulp.task("minify", function() {
    return gulp.src('dist/universal/dist.js')

    .pipe(rename('dist.min.js'))
        .pipe(babel({ presets: ["es2015"] }))
        .pipe(replace(/exports : undefined,/, "exports : this,"))
        .pipe(uglify())
        .pipe(gulp.dest('dist/universal'));
})

gulp.task('build-dist-es2015', function() {
    let result = gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(projectEs2015()).js
        .pipe(gulp.dest('dist/es2015'))
});

gulp.task('build-dist-universal', function() {
    let result = gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(project());

    return merge([
        gulp.src('src/**/*.ts')
        .pipe(typingsProject()).dts.pipe(gulp.dest('dist/typings')),
        result.js.pipe(tsUniversal('build/', {
            name: 'wires-html-parser',
            expose2window: true,
            expose: 'index',
        }))
        .pipe(rename('dist.js'))
        .pipe(gulp.dest('dist/universal'))
    ]);
});
gulp.task("dist", ["build-dist-universal", "build-dist-es2015"], function() {
    return runSequence("minify");
});

gulp.task('test', ['dist'], function() {
    runSequence('run-mocha')
});