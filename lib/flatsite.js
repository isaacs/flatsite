var fs = require('fs'),
	plates = require('plates'),
	shell = require('shelljs'),
	path = require('path'),
	chokidar = require('chokidar'),
	out = require('./out.js');

exports.generate = function(params) {
	//setting defaults
	var params = (params === undefined) ? [] : params;
	var source = (params.source === undefined) ? "./site/" : params.source;
	var destination = (params.destination === undefined) ? "./public/" : params.destination;
	var persistent = (params.persistent === undefined) ? true : params.persistent;

	if (persistent){
		//watch for changes in source file and re-generate the site
		var watch = chokidar.watch([source + 'pages', source + 'partials', source + 'templates'], {persistent: true, ignoreInitial: true});
		watch.on('all', function(changed) {
			generateSite(source, destination);
			console.log('Ok -> site created!');
		});
	} else {
		//re-generate the site
		generateSite(source, destination);
	}
}

function generateSite(source, destination){
	var template = '';
	var pages = [];
	var partials = [];
	//clean html files in destination dir
	shell.rm('-rf', destination + '*.html');

	//read generic tamplate file
	try{
		template = fs.readFileSync( source + 'templates/default.html', 'utf-8');
	} catch(err) {
		console.log('Error -> reading templates/default.html');
	}

	//read file list in template directory and filter html files
	try{
		pages = fs.readdirSync( source +'pages/');
    } catch(err) {
		console.log('Error -> reading pages');
	}

    pages = pages.filter(function(file){
		return file.substr(-5) == '.html'
	});

	//read file list in partial directory
	try{
		var partials = fs.readdirSync( source + 'partials/');
	} catch(err) {
		console.log('Error -> reading partials');
	}

	partials = partials.filter(function(file){
		return file.substr(-5) == '.html'
	});

	//process and creat all pages
    pages.forEach(function(page){
		try{
			//read JSON additional file (title, meta ecc.)
			//the name of the file must be the same of the html file
			var fileName = path.basename(page, '.html');		
			var data = fs.readFileSync( source + 'pages/' + fileName + '.json', 'utf-8');
			var pageHTML = fs.readFileSync(source + 'pages/' + page, 'utf-8');
			var dataJSON = JSON.parse(data);

			//mapping data and main page creation
			var mapPage = plates.Map();
			mapPage.tag("title").use("title");
			mapPage.class('main').append(pageHTML);
			mapPage.where('name').is('description').use('meta-description').as('content');
			var content = plates.bind(template, dataJSON ,mapPage);

			//processing all partial and mapping to the pre-processed page
			partials.forEach(function(partial){
				var className = path.basename(partial, '.html');
				var partialHTML = fs.readFileSync(source + 'partials/' + partial, 'utf-8');
				var mapPartial = plates.Map();
				mapPartial.class(className).append(partialHTML);
				content = plates.bind(content, {}, mapPartial);
			});

			//writing page
			out.write(destination, content, page);
		} catch(err){
			console.log('Error -> ' + page);
		}

	});
}