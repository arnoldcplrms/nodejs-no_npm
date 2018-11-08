const http = require("http"),
    unifiedServer = require('./unifiedServer'),
    config = require('./config'),
    https = require('https'),
    fs = require('fs'),
    _data = require('./lib/data')

// _data.delete('test', 'newFile')
//     .then(() => {
//         console.log("Success");
//     })
//     .catch(err => {
//         console.log('Error', err);
//     })

http.createServer((req, res) => {
    unifiedServer(req, res);
}).listen(config.httpPort, () => {
    console.log(`Listening to port ${config.httpPort}`);
});

const httpsServerOptions = {
    "key": fs.readFileSync('./https/key.pem'),
    "cert": fs.readFileSync('./https/cert.pem')
}

https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
}).listen(config.httpsPort, () => {
    console.log(`Listening to port ${config.httpsPort}`);
});