exports = module.exports = FsProvider;

var fs = require("fs");
var path = require("path");
var async = require("async");

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

        readConfig: function (callback) {
            fs.readFile(path.join(dir, "nops.json"), { encoding: "utf8" }, function (err, content) {
                
                if (err)
                    throw err;
                
                var config = JSON.parse(content);
                callback(err, content);
            });
        },
        getContents: function (callback) {
            readContents(dir, callback);
        },
        createReadStream: function (subpath) {
            return fs.createReadStream(path.join(dir, subpath));
        },
        createWriteStream: function (subpath) {
            return fs.createWriteStream(path.join(dir, subpath));
        }
    };
};