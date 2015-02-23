var stream = require("stream");

exports = module.exports = function () {
    var t = new stream.Transform({ objectMode: true });
    
    t.bindResolver = function (resolver) {
        t._resolver = resolver;
    };
    
    t._parse = function (str) {
        var idx = 0;
        while (idx < str.length) {
            var begin = str.indexOf("{{", idx);
            if (begin == -1) {
                this.push(str.substr(idx));
                idx = str.length;
            } else {
                // check if it is escaped
                if (str[begin + 2] == '{') {
                    this.push(str.substr(idx, begin - idx + 2));
                    idx = begin + 3;
                } else {
                    // search the end
                    var end = str.indexOf("}}", begin);
                    if (end == -1) {
                        // check whether the rest of the data contains a whitespace - then no token
                        if (!/^\S*$/.test(str.substring(begin))) {
                            // push data - no token
                            this.push(str.substr(idx));
                            idx = str.length;
                            break;
                        }
                        // at this point store the rest in prev there be a valid token 
                        this.push(str.substr(idx, begin - idx));
                        idx = begin;
                        break;
                    } else {
                        var token = str.substr(begin + 2, end - begin - 2);
                        if (!/^\S*$/.test(token)) {
                            // token contains whitespace - abort
                            this.push(str.substr(idx, end + 2));
                            idx = end + 2;
                            continue;
                        }
                        // push til the begin
                        var wasresolved = false;
                        this.push(str.substr(idx, begin - idx));
                        if (this._resolver) {
                            var bucket = this._resolver(token);
                            if (bucket.resolved) {
                                this.push(bucket.value);
                                wasresolved = true;
                            }
                        }
                        if (!wasresolved)
                            this.push(str.substr(begin, end - begin + 2));
                        idx = end + 2;
                    }
                }
            }
        }
        return idx;
    };
    
    t._transform = function (chunk, encoding, done) {
        var str = chunk.toString();
        
        if (this._prevStr)
            str = this._prevStr + str;
        
        var idx = this._parse(str);
        if (idx < str.length) {
            this._prevStr = str.substr(idx);
        }
        done();
    };
    
    t._flush = function (done) {
        if (this._prevStr) {
            var idx = this._parse(this._prevStr);
            if (idx < this._prevStr.length) {
                this.push(this._prevStr.substr(idx));
            }
        }
        this._prevStr = null;
        done();
    };
    return t;
};
