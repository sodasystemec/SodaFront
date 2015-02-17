'use strict';

var gulp    = require('gulp'),
	connect = require('gulp-connect'),
	stylus  = require('gulp-stylus'),
	nib     = require('nib'),
	jshint  = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	inject  = require('gulp-inject'),
	wiredep = require('wiredep').stream,
	historyApiFallback = require('connect-history-api-fallback');

gulp.task('inject', function() {
	var sources = gulp.src(['./app/scripts/**/*.js','./app/stylesheets/**/*.css']);
	return gulp.src('index.html', {cwd: './app'})
		.pipe(inject(sources, {
				read: false,
				ignorePath: '/app'
			}))
		.pipe(gulp.dest('./app'));
});

gulp.task('wiredep', function () {
	gulp.src('./app/index.html')
	.pipe(wiredep({
		directory: './app/lib'
	}))
	.pipe(gulp.dest('./app'));
});

gulp.task('server', function() {
	connect.server({
		root: './app',
		hostname: '0.0.0.0',
		port: 8080,
		livereload: true,
		middleware: function(connect, opt) {
			return [ historyApiFallback ];
		}
	});
});


gulp.task('jshint', function() {
	return gulp.src('./app/scripts/**/*.js')
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});


gulp.task('css', function() {
	gulp.src('./app/stylus/**/*.styl')
		.pipe(stylus({ use: nib() }))
		.pipe(gulp.dest('./app/stylesheets'))
		.pipe(connect.reload());
});


gulp.task('html', function() {
	gulp.src('./app/**/*.html')
		.pipe(connect.reload());
});

gulp.task('watch', function() {
	gulp.watch(['./app/**/*.html'],['html']);
	gulp.watch(['./app/stylus/**/*.styl'], ['css', 'inject']);
	gulp.watch(['./app/scripts/**/*.js', './Gulpfile.js'], ['jshint', 'inject']);
	gulp.watch(['./bower.json'], ['wiredep']);
});
	
gulp.task('default', ['server', 'inject', 'wiredep', 'watch']);

var gulpif     = require('gulp-if'),
	minifyCss  = require('gulp-minify-css'),
	useref     = require('gulp-useref'),
	uglify     = require('gulp-uglify'),
	minifyHTML = require('gulp-minify-html'),
	uncss      = require('gulp-uncss');


gulp.task('compress',function() {
	var assets = useref.assets(),
	opts = { comments:false };

	gulp.src('./app/*.html')
		.pipe(assets)
		.pipe(gulpif('*.css',minifyCss({keepSpecialComments : 0})))
		.pipe(gulpif('*.js', uglify({mangle: false })))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('./build'));
	
	setTimeout(function(){
		gulp.src('./build/*.html')
			.pipe(minifyHTML(opts))
			.pipe(gulp.dest('./build'));
	},1000);
});

gulp.task('uncss', function() {
	setTimeout(function(){
		gulp.src('./build/stylesheets/main.min.css')
			.pipe(uncss({
				html: ['./app/index.html']
			}))
			.pipe(minifyCss({keepSpecialComments : 0}))
			.pipe(gulp.dest('./build/stylesheets'));
	},2000);
});

gulp.task('build',['compress','uncss']);

gulp.task('server-build',function(){
	connect.server({
		root: './build',
		hostname: '0.0.0.0',
		port: 8080,
		livereload: true,
		middleware: function(connect, opt) {
			return [ historyApiFallback ];
		}
	});
});

