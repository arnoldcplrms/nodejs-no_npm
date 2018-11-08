const url = require('url'),
    StringDecoder = require('string_decoder').StringDecoder,
    helpers = require('./lib/helpers'),
    handlers = require('./lib/handlers')

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStrObj = parsedUrl.query;
    const headers = req.headers;
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', data => {
        buffer += decoder.write(data)
    }).on('end', async() => {
        buffer += decoder.end();

        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ?
            router[trimmedPath] : handlers.notFound;

        const data = {
            payload: helpers.parseJsonToObject(buffer),
            trimmedPath,
            queryStrObj,
            method,
            headers,
        }


        // await chosenHandler(data, (statusCode, payload) => {

        // });
        // try {
        const res = await chosenHandler(data)
        console.log(res);
        statusCode = typeof(statusCode) == 'number' ?
            statusCode : 200;

        payload = typeof(payload) == 'object' ? payload : {};
        const payloadString = JSON.stringify(payload);

        res.setHeader('Content-Type', 'application/json')
        res.writeHead(statusCode);
        res.end(payloadString);
        // } catch (error) {

        // }
    })
}



const router = {
    "ping": handlers.ping,
    "users": handlers.users
}