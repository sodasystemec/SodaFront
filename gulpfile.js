'use strict';

var gulp    = require('gulp'),
	connect = require('gulp-connect'),
	stylus  = require('gulp-stylus'),
	nib     = require('nib'),
	jshint  = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	inject  = require('gulp-inject'),
	wiredep = require('wiredep').stream,
	historyApiFallback = require('connect-history-api-fallback'),
	rupture = require('rupture'),
	Pageres = require('pageres'),
	util = require('gulp-util'),
	notify = require('gulp-notify');


var params = {
	'folderApp' : './app',
	'folderDist': './dist'
};


var devices = ['1024x768','480x320','1800x968','iphone5s'];

gulp.task('shot', function(){
	var pageres = new Pageres({delay:4})
		.src('ramonchancay.com',devices,{crop:false})
		.dest(params.folderApp+'captures/');

	pageres.run(function(err){
		if(err){
			throw err;
		}
		console.log('Capturas realizadas');
	});
});

gulp.task('inject', function() {
	var sources = gulp.src([params.folderApp+'scripts/**/*.js',params.folderApp+'stylesheets/**/*.css']);
	return gulp.src('index.html', {cwd: './app'})
		.pipe(inject(sources, {
				read: false,
				ignorePath: '/app'
			}))
		.pipe(gulp.dest('./app'));
});

gulp.task('wiredep', function () {
	/*gulp.src(params.folderApp+'index.html')
	.pipe(wiredep({
		directory: params.folderApp+'lib'
	}))
	.pipe(gulp.dest('./app'));*/
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
	return gulp.src(params.folderApp+'scripts/**/*.js')
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});


gulp.task('css', function() {
	gulp.src(params.folderApp+'stylus/**/main.styl')
		.pipe(stylus({ use: [nib(),rupture()] }))
		.pipe(gulp.dest(params.folderApp+'stylesheets'))
		.pipe(connect.reload());
});


gulp.task('html', function() {
	gulp.src(params.folderApp+'**/*.html')
		.pipe(connect.reload());
});

gulp.task('watch', function() {
	gulp.watch([params.folderApp+'**/*.html'],['html']);
	gulp.watch([params.folderApp+'stylus/**/*.styl'], ['css', 'inject']);
	gulp.watch([params.folderApp+'scripts/**/*.js', './Gulpfile.js'], ['jshint', 'inject']);
	//gulp.watch(['./bower.json'], ['wiredep']);
});
	
gulp.task('default',function(){
	
	try{
		if(typeof util.env.folder !== undefined && typeof util.env.dist !== undefined){
			params.folderApp = util.env.folder;
			params.folderDist = util.env.dist;
			gulp.run('launch');
		}
	}catch(e){
		gulp.run('launch');
	}
});	


gulp.task('launch', ['server', 'inject', 'wiredep', 'watch']);

var gulpif     = require('gulp-if'),
	minifyCss  = require('gulp-minify-css'),
	useref     = require('gulp-useref'),
	uglify     = require('gulp-uglify'),
	minifyHTML = require('gulp-minify-html'),
	uncss      = require('gulp-uncss');


gulp.task('compress',function() {
	var assets = useref.assets(),
	opts = { comments:false };

	gulp.src(params.folderApp+'*.html')
		.pipe(assets)
		.pipe(gulpif('*.css',minifyCss({keepSpecialComments : 0})))
		.pipe(gulpif('*.js', uglify({mangle: false })))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest(params.folderDist+''));
	
	setTimeout(function(){
		gulp.src(params.folderDist+'/*.html')
			.pipe(minifyHTML(opts))
			.pipe(gulp.dest(params.folderDist+''));
	},1000);
});

gulp.task('uncss', function() {
	setTimeout(function(){
		gulp.src(params.folderDist+'/stylesheets/main.min.css')
			.pipe(uncss({
				html: [params.folderApp+'index.html']
			}))
			.pipe(minifyCss({keepSpecialComments : 0}))
			.pipe(gulp.dest(params.folderDist+'/stylesheets'));
	},2000);
});

gulp.task('build',['compress','uncss']);

gulp.task('server-build',function(){
	connect.server({
		root: params.folderDist+'',
		hostname: '0.0.0.0',
		port: 8080,
		livereload: true,
		middleware: function(connect, opt) {
			return [ historyApiFallback ];
		}
	});
});

