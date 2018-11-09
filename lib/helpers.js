const crypto = require('crypto');
const { hashingSecret } = require('../config')

module.exports = {
    hash: (str) => {
        let res;
        (typeof(str) == 'string' && str.length > 0) ?
        res = crypto.createHmac('sha256', hashingSecret)
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
    responseHelper: (statusCode, payload, errorObject = null) => {
        if (errorObject) {
            console.log(errorObject);
            return {
                statusCode,
                payload,
            }
        } else {
            return {
                statusCode,
                payload,
            }
        }
    }
}