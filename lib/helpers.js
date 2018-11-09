const crypto = require('crypto');
const config = require('../config')

module.exports = {
    hash: (str) => {
        let res;
        (typeof(str) == 'string' && str.length > 0) ?
        res = crypto.createHmac('sha256', config.hashingSecret)
            .update(str)
            .digest('hex'): res = false;

        return res;
    },
    parseJsonToObject: (str) => {
        try {
            return JSON.parse(str)
        } catch (error) {
            return {}
        }
    },
    responseHelper: (statusCode, payload) => {
        return {
            statusCode,
            payload
        }
    }
}