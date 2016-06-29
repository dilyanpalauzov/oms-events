var gulp = require('gulp');
var webserver = require('gulp-webserver');
var nodemon = require('gulp-nodemon');
var supervisor = require('gulp-supervisor');
var proxy = require('http-proxy-middleware');
var config = require('./lib/config/config.json');

gulp.task('frontend', function () {
	// Redirect api calls to the backend server
	var apiProxy = proxy('/api', {
        target: 'http://localhost:' + config.port + '/',
		pathRewrite: {'^/api': '/'}
    });

	// Redirect static requests to the static server of oms-profiles-module
    var staticProxy = proxy('/static', {
    	target: 'http://localhost:8081/'
    });
	
    gulp.src('frontend')
		.pipe(webserver({
			host: '0.0.0.0',
			livereload: false,
			port: 8083,
			fallback: 'index.html',
			middleware: [apiProxy, staticProxy]
		}));
});


gulp.task('backend', function () {

    // Start the Node server to provide the API
    // Supervisor manages to reload stuff
    //supervisor("lib/server.js");
    // Nodemon takes less than 20% cpu usage
    nodemon({ script: 'lib/server.js', 
    			ext: 'js',
    			watch: ['lib', 'lib/config'] })
        .on('restart', function () {
            console.log('Node server restarted!')
        });
});


gulp.task('default', ['frontend', 'backend']);
