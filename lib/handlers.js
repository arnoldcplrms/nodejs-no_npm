const { responseHelper } = require('./helpers'),
    _users = require('./route_handlers/users'),
    _tokens = require('./route_handlers/tokens'),
    _checks = require('./route_handlers/checks')

const requestHandler = async(acceptableMethods, serviceModule, data) => {
    try {
        let res;
        acceptableMethods.indexOf(data.method) > -1 ?
            res = await serviceModule[data.method](data, _tokens.verifyToken) :
            res = responseHelper(405, { error: "Method not allowed" });

        return res;
    } catch (error) {
        console.log(error);
        return responseHelper(500, { error: error.message });
    }
}

module.exports = {
    ping: () => {
        return Promise.resolve(responseHelper(200, { message: "Im alive" }))
    },
    notFound: () => {
        return Promise.resolve(responseHelper(404, { message: "Not found." }))
    },
    users: async data => {
        return await requestHandler(
            ['post', 'put', 'get', 'delete'],
            _users,
            data
        );
    },
    tokens: async data => {
        return await requestHandler(
            ['post', 'put', 'get', 'delete'],
            _tokens,
            data
        );
    },
    checks: async data => {
        return await requestHandler(
            ['post', 'put', 'get', 'delete'],
            _checks,
            data
        );
    }
}