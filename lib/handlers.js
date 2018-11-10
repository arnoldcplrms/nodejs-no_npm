const { responseHelper } = require('./helpers'),
    _users = require('./route_handlers/users'),
    _tokens = require('./route_handlers/tokens')

module.exports = {
    ping: (data) => {
        return Promise.resolve(responseHelper(200, { message: "Im alive" }))
    },
    notFound: (data) => {
        return Promise.resolve(responseHelper(404, { message: "Not found." }))
    },
    users: async(data) => {
        try {
            let res;
            const acceptableMethods = ['post', 'put', 'get', 'delete']
            acceptableMethods.indexOf(data.method) > -1 ?
                res = await _users[data.method](data, _tokens.verifyToken) :
                res = responseHelper(405, { error: "Method not allowed" });

            return res;
        } catch (error) {
            console.log(error);
            return responseHelper(500, { error: error.message });
        }
    },
    tokens: async(data) => {
        try {
            let res;
            const acceptableMethods = ['post', 'put', 'get', 'delete']
            acceptableMethods.indexOf(data.method) > -1 ?
                res = await _tokens[data.method](data) :
                res = responseHelper(405, { error: "Method not allowed" });

            return res;
        } catch (error) {
            console.log(error);
            return responseHelper(500, { error: error.message });
        }
    }
}