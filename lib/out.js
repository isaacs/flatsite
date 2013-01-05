var fs = require('fs');

exports.write = function(path, content, slug){
    try {
        fd = fs.openSync(path + slug, "w");
		fs.writeSync(fd, content, 0, "utf8");
	} catch (e) {
        console.log(e + ': Error Writing File');
    }
}