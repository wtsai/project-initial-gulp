var gulp = require("gulp"),
	path = require("path"),
	browserSync = require('browser-sync');
	reload = browserSync.reload;
	es = require('event-stream'),
	pkg = require("./package.json"),
	gulpLoadPlugins = require('gulp-load-plugins'),
	plugins = gulpLoadPlugins();
	
var SRC  = "src";
var DIST = "dist";
var MAIN_SCRIPT = "app.js";
var SRC_bootstrap  = "components/bootstrap/dist/js";
var SRC_angular  = "components/angular";
var SRC_jquery  = "components/jquery/dist";

var SRC_PATH = {
	scripts: path.join(SRC, "public/javascripts", "*"),
	components: [path.join(SRC, SRC_bootstrap, "bootstrap.js"), 
				 path.join(SRC, SRC_angular, "angular.js"), 
				 path.join(SRC, SRC_jquery, "jquery.js")],
	components_min: [path.join(SRC, SRC_bootstrap, "bootstrap.min.js"), 
					 path.join(SRC, SRC_angular, "angular.min.js"), 
					 path.join(SRC, SRC_jquery, "jquery.min.js")],
	images: path.join(SRC, "public/images", "*"),
	less: path.join(SRC, "public/less", "*"),
	package: path.join(SRC, "package.json"),
};

var APP_PATH = {
	bin: path.join(SRC, "bin", "**"),
	routes: path.join(SRC, "routes", "**"),
	views: path.join(SRC, "views", "**"),
	main: path.join(SRC, MAIN_SCRIPT) 
};

var Replace_cmd = {
	images: 'images',
	bootstrapcss: 'stylesheets/custom-bootstrap.less',
	maincss: 'stylesheets/room.less',
	jqueryjs: 'jquery/dist/jquery.js',
	bootstrapjs: 'bootstrap/dist/js/bootstrap.js',
	angularjs: 'angular/angular.js',
	mainjs: 'javascripts/technode.js'
};

var Replaced_PATH = {
	images: 'img',
	bootstrapcss: "css/custom-bootstrap.min.css",
	maincss: "css/room.min.css",
	jqueryjs: "js/jquery.min.js",
	bootstrapjs: "js/bootstrap.min.js",
	angularjs: "js/angular.min.js",
	mainjs: "js/technode.min.js"
};

var DIST_PATH = {
	scripts: path.join(DIST, "public/js"),
	images: path.join(DIST, "public/img"),
	css: path.join(DIST, "public/css"),
	bin: path.join(DIST, "bin"),
	routes: path.join(DIST, "routes"),
	views: path.join(DIST, "views"),
	main: DIST
};

var CheckEmptyDir = function(es) {
	return es.map(function(file, cb) {
		if (file.stat.isFile()) {
			return cb(null, file);
		} else {
			return cb();
		}
	});
};

// Updates the Bower dependencies based on the bower.json file
gulp.task("update", function(next) {

	var bowerInstall = false;

	gulp.src(path.join(SRC, "bower.json"))
	//.pipe(plugins.newer(".build"))
	.pipe(gulp.dest(".")) 
	.on("close", function() {
		if (!bowerInstall) {
			next();
		}
	})
	.on("error", function(error) {
		if (!bowerInstall) {
			next(error);
		}
	})
	.on("data", function() {
		bowerInstall = true;
		console.log("Install Bower Dependencies");
		require("bower").commands.install([], {}, { interactive: false })
		.on("end", function () {
			console.log("Finished to install Bower Dependencies.");
			gulp.src(["bower.json"], {read: false})
				.pipe(plugins.rimraf());
			next();
		})
		.on("log", function (log) {
			if (log.level == "action" && log.id == "install") {
				console.log("Added Bower Dependency: " + log.message);
			}
		})
		.on("error", function (error) {
			console.log(error);
			next(error);
		});
	})
});

// Minify the CSS
gulp.task("dist:less", ["update"], function() {
	return gulp.src(SRC_PATH.less)
		.pipe(CheckEmptyDir(es))
		.pipe(plugins.less())
		.pipe(plugins.rename({ suffix: ".min" }))
		.pipe(plugins.minifyCss())
		.pipe(gulp.dest(DIST_PATH.css));
});

// Uglify the JS
gulp.task("dist:javascript", ["update"], function() {
	return gulp.src(SRC_PATH.scripts)
		.pipe(CheckEmptyDir(es))
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter(require('jshint-stylish')))
		.pipe(plugins.rename({ suffix: ".min" }))
		.pipe(plugins.ngAnnotate()) // ng-annotate makes angular injection syntax compatible with uglify
		.pipe(plugins.uglify())
		.pipe(gulp.dest(DIST_PATH.scripts));
});


// Compress the images
gulp.task("dist:images", ["update"], function() {
	return gulp.src(SRC_PATH.images)
		.pipe(CheckEmptyDir(es))
		.pipe(plugins.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(gulp.dest(DIST_PATH.images));
});

gulp.task("copy-app-minify", function() { 
	gulp.src(SRC_PATH.components_min)
		.pipe(gulp.dest(DIST_PATH.scripts));
	gulp.src(APP_PATH.bin)
		.pipe(CheckEmptyDir(es))
		.pipe(gulp.dest(DIST_PATH.bin));
	gulp.src(APP_PATH.routes)
		.pipe(CheckEmptyDir(es))
		.pipe(gulp.dest(DIST_PATH.routes));
	gulp.src(APP_PATH.views)
		.pipe(CheckEmptyDir(es))
		.pipe(plugins.replace(Replace_cmd.images, Replaced_PATH.images))
		.pipe(plugins.replace(Replace_cmd.bootstrapcss, Replaced_PATH.bootstrapcss))
		.pipe(plugins.replace(Replace_cmd.maincss, Replaced_PATH.maincss))
		.pipe(plugins.replace(Replace_cmd.jqueryjs, Replaced_PATH.jqueryjs))
		.pipe(plugins.replace(Replace_cmd.bootstrapjs, Replaced_PATH.bootstrapjs))
		.pipe(plugins.replace(Replace_cmd.angularjs, Replaced_PATH.angularjs))
		.pipe(plugins.replace(Replace_cmd.mainjs, Replaced_PATH.mainjs))
		.pipe(gulp.dest(DIST_PATH.views));
	gulp.src(APP_PATH.main)
		.pipe(gulp.dest(DIST_PATH.main));	
});

gulp.task("npm-install", function() {
	return gulp.src(SRC_PATH.package)
		.pipe(gulp.dest(DIST))
		.pipe(plugins.install());
});

// Clean the DIST dir
gulp.task("clean", function() {
	return gulp.src([DIST], {read: false})
		.pipe(plugins.rimraf());
});

gulp.task("prod", ["copy-app-minify", "npm-install", "dist:less", "dist:javascript", "dist:images"]);

gulp.task('browser-sync', ["prod"], function() {
    browserSync({
        proxy: "http://localhost:9000/" //need to use express().port
    });
});

// Reload all Browsers
gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('start', ["browser-sync"], function (cb) {
	gulp.watch(SRC_PATH.scripts, ["bs-reload", "dist:javascript"]);
	gulp.watch(SRC_PATH.images, ["bs-reload", "dist:images"]);
	gulp.watch(SRC_PATH.less, ["bs-reload", "dist:less"]);
	gulp.watch(APP_PATH.views, ["bs-reload", "copy-app-minify"]);
	gulp.watch(path.join(SRC, "bower.json"), ["update"]);
	
	require('child_process').exec('node ' + path.join(DIST, "bin", "www"), function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
})

gulp.task("help", function(next) {
	console.log("--- " + pkg.name + " ---");
	console.log("");
	console.log("See all of the available tasks:");
	console.log("$ gulp -T");
	console.log("");
	console.log("Start a prodution server:");
	console.log("$ gulp start");
	next();
});

// Default
gulp.task("default", ["help"]);