var assert = require("assert");

describe("Content Transformer", function () {
    
    function callTransformer(input, callback) {
        var t = require("../lib/content-transformer")();
        t.setEncoding("utf8");
        var result = "";
        t.on("data", function (data) {
            result += data.toString();
        });
        t.on("end", function () {
            callback(result);
        });
        t.write(input);
        t.end();
    }

    it("does nothing", function (done) {
        callTransformer("hallo test", function (result) {
            assert.equal("hallo test", result);
            done();
        });
    });

    it("does nothing with escaped marker", function (done) {
        callTransformer("hallo test {{{eins}}", function (result) {
            assert.equal("hallo test {{eins}}", result);
            done();
        });
    });

    it("replaces handlebar", function (done) {
        callTransformer("hallo test {{replace}} eins", function (result) {
            assert.equal("hallo test  eins", result);
            done();
        });
    });

    it("does nothing incomplete handlebar at end", function (done) {
        callTransformer("hallo test {{replace", function (result) {
            assert.equal("hallo test {{replace", result);
            done();
        });
    });

    it("does nothing handlebar with whitespace", function (done) {
        callTransformer("hallo test {{rep lace}}", function (result) {
            assert.equal("hallo test {{rep lace}}", result);
            done();
        });
    });

    it("does nothing handlebar with whitespace at end", function (done) {
        callTransformer("hallo test {{rep lace", function (result) {
            assert.equal("hallo test {{rep lace", result);
            done();
        });
    });
});