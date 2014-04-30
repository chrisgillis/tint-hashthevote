var gulp = require('gulp')

var jshint    = require('gulp-jshint')
var sass      = require('gulp-sass')
var minifyCSS = require('gulp-minify-css')

// Linting
gulp.task('lint', function() {
    return gulp.src('public/assets/js/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
});

// Sass
gulp.task('sass', function() {
    return gulp.src('public/assets/scss/*.scss')
            .pipe(sass())
            .pipe(minifyCSS({keepBreaks:true}))
			.pipe(gulp.dest('public/assets/css'));
});

// Watch
gulp.task('watch', function() {
    gulp.watch('public/assets/js/*.js', ['lint']);
    gulp.watch('public/assets/scss/*.scss', ['sass']);
});

// Default Tasks
gulp.task('default', ['lint', 'sass', 'watch']);