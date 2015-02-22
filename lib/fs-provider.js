exports = module.exports = FsProvider;

var fs = require("fs");
var path = require("path");
var async = require("async");
var mkdirp = require("mkdirp");

function FsProvider(dir) {
    
    function readContents(currdir, callback) {
        var contents = {};

        fs.readdir(currdir, function (err, dirContent) {
            async.map(dirContent, function (entry, entryCallback) {
                
                fs.stat(path.join(currdir, entry), function (err, stat) {
                    entryCallback(err, {
                        stat: stat,
                        subdir: entry
                    })
                });
            }, function (err, entries) {
                var pending = entries.length;

                entries.forEach(function (stat) {
                    if (stat.stat.isDirectory()) {
                        
                        readContents(path.join(currdir, stat.subdir), function (err, subcontents) {
                            contents[stat.subdir] = subcontents;
                            if (--pending == 0)
                                callback(err, contents);
                        });

                    } else {
                        contents[stat.subdir] = null;
                        --pending;
                    }
                });
                if (pending == 0)
                    callback(null, contents);
            });
        });

    }

    return {
        getContents: function (callback) {
            readContents(dir, callback);
        },
        createDir: function (subpath, callback) {
            mkdirp(path.join(dir, subpath), function (err) {
                callback(err);
            });
        },
        createReadStream: function (subpath) {
            return fs.createReadStream(path.join(dir, subpath));
        },
        createWriteStream: function (subpath) {
            return fs.createWriteStream(path.join(dir, subpath));
        }
    };
};