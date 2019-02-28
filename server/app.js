/**
 * Created by CHEN-BAO-DENG on 2018/2/11 0011.
 */

var express = require('express');
var app = express();

app.use(express.static('public'));
app.use('/v', express.static('public'));

app.get('/', function (req, res) {
    res.send('Hello World!');
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
