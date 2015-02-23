var assert = require("assert");

describe("Content Transformer", function () {
    
    function callTransformer(input, resolve, callback) {
        var t = require("../lib/content-transformer")();
        t.bindResolver(function (token) {
            return {
                resolved: resolve,
                value: "resolved"
            };
        });
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
        callTransformer("hallo test", true, function (result) {
            assert.equal("hallo test", result);
            done();
        });
    });

    it("does nothing with escaped marker", true, function (done) {
        callTransformer("hallo test {{{eins}}", function (result) {
            assert.equal("hallo test {{eins}}", result);
            done();
        });
    });

    it("replaces handlebar", function (done) {
        callTransformer("hallo test {{replace}} eins", true, function (result) {
            assert.equal("hallo test resolved eins", result);
            done();
        });
    });
    
    it("does not replace unresolved handlebar", function (done) {
        callTransformer("hallo test {{replace}} eins", false, function (result) {
            assert.equal("hallo test {{replace}} eins", result);
            done();
        });
    });

    it("does nothing incomplete handlebar at end", function (done) {
        callTransformer("hallo test {{replace", true, function (result) {
            assert.equal("hallo test {{replace", result);
            done();
        });
    });

    it("does nothing handlebar with whitespace", function (done) {
        callTransformer("hallo test {{rep lace}}", true, function (result) {
            assert.equal("hallo test {{rep lace}}", result);
            done();
        });
    });

    it("does nothing handlebar with whitespace at end", function (done) {
        callTransformer("hallo test {{rep lace", true, function (result) {
            assert.equal("hallo test {{rep lace", result);
            done();
        });
    });
});