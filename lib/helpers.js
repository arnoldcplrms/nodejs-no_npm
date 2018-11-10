const crypto = require('crypto')
const { hashingSecret } = require('../config')

const stringRandomizer = (strLength) => {
    let str = '';
    const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < strLength; i++) {
        let randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
        str += randomChar;
    }
    return str
}

module.exports = {
    hash: str => {
        let res;
        (typeof(str) == 'string' && str.length > 0) ?
        res = crypto.createHmac('sha256', hashingSecret)
            .update(str)
            .digest('hex'): res = false;

        return res;
    },
    parseJsonToObject: str => {
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
    },
    errorResponse: (message, errorObject) => {
        console.log(errorObject);
        return {
            statusCode: 500,
            payload: {
                error: message
            }
        }
    },
    createRandomString: strLength => {
        let res;
        strLength = typeof(strLength) == 'number' && strLength > 0 ?
            strLength : false;

        strLength ? res = stringRandomizer(strLength) : res = false;
        return res;
    }
}