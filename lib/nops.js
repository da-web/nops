var path = require("path");
var transformerCtor = require("./content-transformer.js");

exports = module.exports = Nops;

function Nops() {

};

Nops.exec = function (opts) {
    var log = function (msg, level) {
        console.log(msg);
    }
    log("NOPS");
    var inputProv = require("./fs-provider")(opts.source);
    var outputProv = require("./fs-provider")(opts.target);
    
    var config;

    function resolver(token) {
        return "unknown";
    }
    
    function considerContent(filepath) {
        return true;
    }
    
    function applyContentReplace(filepath) {
        if (config.contentreplace) {
            return config.contentreplace.indexOf(filepath) != -1;
        }
        return false;
    }
    
    function processDirContents(basedir, contents, callback) {
        // TODO error handling here
        var pending = Object.keys(contents).length;
        for (var entry in contents) {
            var inputpath = path.join(basedir, entry);
            if (!considerContent(inputpath)) {
                --pending;
                continue;
            }
            var subdir = contents[entry];
            if (subdir) {
                outputProv.createDir(path.join(basedir, entry), function (err) {
                    // TODO error handling
                    processDirContents(path.join(basedir, entry), subdir, function () {
                        if (--pending == 0)
                            callback();
                    });
                });
                continue;
            }
            var input = inputProv.createReadStream(inputpath);
            if (applyContentReplace(inputpath)) {
                input.setEncoding("utf8");
                // TODO check whether transformation is required
                var transformer = transformerCtor();
                transformer.bindResolver(resolver);
                input = input.pipe(transformer);
            }
            var output = outputProv.createWriteStream(path.join(basedir, entry));
            input.pipe(output);
            --pending;
        }
        if (pending == 0)
            callback();
    }
    
    // process contents
    inputProv.getContents(function (err, contents) {
        
        // check for config file
        if (!contents.hasOwnProperty("nops.json")) {
            throw "no config file!";
        }
        delete contents["nops.json"];
        var configData = "";
        var configStream = inputProv.createReadStream("nops.json");
        configStream.setEncoding("utf8");
        configStream.on("data", function (chunk) {
            configData += chunk;
        });
        configStream.on("end", function () {
            
            config = JSON.parse(configData);
            log("Config parsed.");     
            processDirContents("", contents, function (err, result) {


            });

        });
    });
};