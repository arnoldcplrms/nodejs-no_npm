const { responseHelper, errorResponse, createRandomString } = require('../helpers');
const _data = require('../data');
const { maxChecks } = require('../../config');

const isPayloadValid = (payload) => {
    let res;

    const protocol = typeof(payload.protocol) == 'string' && ['https', 'http'].indexOf(payload.protocol) > -1 ?
        payload.protocol : false;

    const url = typeof(payload.url) == 'string' && payload.url.trim().length > 0 ?
        payload.url.trim() : false;

    const method = typeof(payload.method) == 'string' && ['post', 'put', 'get', 'delete'].indexOf(payload.method) > -1 ?
        payload.method : false;

    const sucessCodes = typeof(payload.sucessCodes) == 'object' &&
        payload.sucessCodes instanceof Array &&
        payload.sucessCodes.length > 0 ?
        payload.sucessCodes : false;

    const timeoutSeconds = typeof(payload.timeoutSeconds) == 'number' &&
        payload.timeoutSeconds % 1 === 0 &&
        payload.timeoutSeconds >= 1 &&
        payload.timeoutSeconds <= 5 ?
        payload.timeoutSeconds : false;

    res = (protocol && url && method && sucessCodes && timeoutSeconds);

    return res ? {
        protocol,
        url,
        method,
        sucessCodes,
        timeoutSeconds
    } : false
}

const checkSetter = async(validPayload, userData, userChecks, phone) => {
    const checkId = createRandomString(20);
    const checkObject = {
        id: checkId,
        userPhone: phone,
        protocol: validPayload.protocol,
        url: validPayload.url,
        method: validPayload.method,
        sucessCodes: validPayload.sucessCodes,
        timeoutSeconds: validPayload.timeoutSeconds
    }
    await _data.create('checks', checkId, checkObject);
    userData.checks = userChecks;
    userData.checks.push(checkId);
    await _data.update('users', phone, userData);
    return responseHelper(200, checkObject)
}

const checkHandler = async(token, validPayload) => {
    try {
        let res;
        const { phone } = await _data.read('tokens', token);
        const userData = await _data.read('users', phone);
        const userChecks = typeof(userData.checks) == 'object' &&
            userData.checks instanceof Array ?
            userData.checks : [];

        userChecks.length < maxChecks ?
            res = await checkSetter(
                validPayload,
                userData,
                userChecks,
                phone
            ) :
            res = responseHelper(400, `The user already has the maximum number of checks (${maxChecks})`)

        return res;
    } catch (error) {
        return responseHelper(403, "")
    }
}

module.exports = {
    post: async data => {
        try {
            const validPayload = isPayloadValid(data.payload);
            if (validPayload) {
                const token = typeof(data.headers.token) == 'string' ?
                    data.headers.token : false;

                return await checkHandler(token, validPayload)
            } else {
                return responseHelper(400, "you have submitted a missing or invalid fields")
            }
        } catch (error) {
            return errorResponse("An error occurred in checks post method", error)
        }
    },
    get: async data => {

    },
    put: async data => {

    },
    delete: async data => {

    }
}