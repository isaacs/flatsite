var flatsite = require('..');
var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    shelljs = require('shelljs');

var settings = {
		source: './test/source/',
		destination: './test/destination/',
		persistent: false
	}

shelljs.rm('-rf', settings.destination + '*.html');

flatsite.generate(settings);


assert.doesNotThrow(
  function() {    
	fs.readFileSync( settings.destination + 'page.html', 'utf-8');
  },
  Error,
  "Page.html not created"
);
