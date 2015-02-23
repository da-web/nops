var nops = require("../lib/nops.js");
var nopt = require("nopt");
var path = require("path");

var knownOpts = {
    "source" : path,
    "target" : path,
    "dumpvars" : Boolean
};

var opts = nopt(knownOpts, {}, process.argv, 2);
nops.exec(opts);