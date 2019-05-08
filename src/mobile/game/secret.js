var crypto = require('crypto');

var ALGORITHM = 'aes-256-ecb';

function fromUrlSafe(str) {
    return str.replace(/-/g, "+").replace(/_/g, "/");
}
function toUrlSafe(str) {
    return str.replace(/\+/g, "-").replace(/\//g, "_");
}

function SimpleStringCipher(secretStr) {
    //secretStr为密钥 S2
    //this.secret = new Buffer(fromUrlSafe(secretStr), 'base64');
    this.secret = new Buffer(fromUrlSafe(secretStr),32);
    console.log('this.secret',this.secret);
}
SimpleStringCipher.prototype = {
    encrypt: function (data) {
        if (!data instanceof Buffer) {
            data = new Buffer('' + data);
        }
        var cipher = crypto.createCipher(ALGORITHM, this.secret);
        var res = cipher.update(data);
        console.log('res',res);
        var rest = cipher.final();
        return toUrlSafe(Buffer.concat([res, rest]).toString('base64'));
    },
    decrypt: function (data) {
        data = new Buffer(fromUrlSafe(data), 'base64');
        var cipher = crypto.createDecipher(ALGORITHM, this.secret);
        var res = cipher.update(data);
        var rest = cipher.final();
        return Buffer.concat([res, rest]).toString();
    }
};

module.exports = SimpleStringCipher;