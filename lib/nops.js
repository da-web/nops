var path = require("path");
var transformerCtor = require("./content-transformer.js");

exports = module.exports = Nops;

function Nops() {

};

Nops.exec = function (opts) {
    var log = function (msg) {
        console.log(msg);
    }
    log("NOPS");
    var inputProv = require("./fs-provider")(opts.source);
    var outputProv = require("./fs-provider")(opts.target);

    inputProv.readConfig(function (err, config) {
    
        log("found config...");
        
        function resolver(token) {
            return "unknown";
        }
        
        function processDirContents(basedir, contents, callback) {
            
            var pending = Object.keys(contents).length;
            for (var entry in contents) {

                var subdir = contents[entry];
                if (subdir) {
                    processDirContents(path.join(basedir, entry), subdir, function () {
                        if (--pending == 0)
                            callback();
                    });
                    continue;
                }

                var input = inputProv.createReadStream(path.join(basedir, entry));
                

                input.setEncoding("utf8");
                
                // TODO scheck whether transformation is required
                var transformer = transformerCtor();
                transformer.bindResolver(resolver);
                
                input = input.pipe(transformer);
                
                var output = outputProv.createWriteStream(path.join(basedir, entry));
                input.pipe(output);
            }
            if (pending == 0)
                callback();

        }
        inputProv.getContents(function (err, contents) {
            processDirContents("", contents, function (err, result) {


            });      
        });
    });
};