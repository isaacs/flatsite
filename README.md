Flatsite - static HTML site generator
=====================================

Description
-----------
Flatsite is a simple static HTML site generator.
It use pure html templates and map content and partials files to main template using the class attribute.

Installation
------------
Flatsite is a standard Node.js module so you can simply install it using npm inside your project folder.

npm install flatsite

Usage
-----
var flatsite = require('flatsite');

flatsite.generate();

In your source directory Flatsite need to find those folders:
- pages : content files
- partials : partial files
- templates : main template file

Dependency
----------
- plates
- chokidar
- shelljs
