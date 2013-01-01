var fs = require('fs'),
	plates = require('plates'),
	shell = require('shelljs'),
	path = require('path'),
	chokidar = require('chokidar'),
	out = require('./out.js');

exports.generate = function(source, destination) {
	//watch for changes in source file and re-generate the site
	var watch = chokidar.watch([source + 'pages', source + 'partials', source + 'templates'], {persistent: true, ignoreInitial: true});
	watch.on('all', function(changed) {
		generateSite(source, destination);
		console.log('site created!');
	});
}

function generateSite(source, destination){
	//clean html files in destination dir
	shell.rm('-rf', destination + '*.html');

	//read generic tamplate file
	var template = fs.readFileSync( source + 'templates/default.html', 'utf-8');

	//read file list in template directory and filter html files
    var dirList = fs.readdirSync( source +'pages/');
    var pagesList = dirList.filter(function(file){
		return file.substr(-5) == '.html'
	});

	//read file list in partial directory
	var partials = fs.readdirSync( source + 'partials/');

	//process and creat all pages
    pagesList.forEach(function(page){

		//read JSON additional file (title, meta ecc.)
		//the name of the file must be the same of the html file
		var fileName = path.basename(page, '.html');		
		var data = fs.readFileSync( source + 'pages/' + fileName + '.json', 'utf-8');
		var dataJSON = JSON.parse(data);

		//mapping data and main page creation
		var mapPage = plates.Map();		
		mapPage.tag("title").use("title");
		mapPage.class('main').append( source +'pages/' + page);
		mapPage.where('name').is('description').use('meta-description').as('content');
		var content = plates.bind(template, dataJSON ,mapPage);

		//processing all partial and mapping to the pre-processed page
		partials.forEach(function(partial){
			var className = path.basename(partial, '.html');
			var mapPartial = plates.Map();
			mapPartial.class(className).append( source + 'partials/' + partial);
			content = plates.bind(content, {}, mapPartial);
		});

		//writing page
		out.write(destination, content, page);
	});
}