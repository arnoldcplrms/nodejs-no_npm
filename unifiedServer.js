const url = require('url'),
    StringDecoder = require('string_decoder').StringDecoder,
    { parseJsonToObject } = require('./lib/helpers'),
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
        try {
            buffer += decoder.end();
            const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ?
                router[trimmedPath] : handlers.notFound;

            const data = {
                payload: parseJsonToObject(buffer),
                trimmedPath,
                queryStrObj,
                method,
                headers,
            }
            const handlerResponse = await chosenHandler(data)
            const statusCode = typeof(handlerResponse.statusCode) == 'number' ?
                handlerResponse.statusCode : 200;

            const payload = typeof(handlerResponse.payload) == 'object' ? handlerResponse.payload : {};
            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadString);
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(500);
            res.end({ error: "An error occured in the unified server" });
        }
    })
}


const router = {
    "ping": handlers.ping,
    "users": handlers.users,
    "tokens": handlers.tokens
}