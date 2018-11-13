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

    const successCodes = typeof(payload.successCodes) == 'object' &&
        payload.successCodes instanceof Array &&
        payload.successCodes.length > 0 ?
        payload.successCodes : false;

    const timeoutSeconds = typeof(payload.timeoutSeconds) == 'number' &&
        payload.timeoutSeconds % 1 === 0 &&
        payload.timeoutSeconds >= 1 &&
        payload.timeoutSeconds <= 5 ?
        payload.timeoutSeconds : false;

    res = (protocol && url && method && successCodes && timeoutSeconds);

    return res ? {
        protocol,
        url,
        method,
        successCodes,
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
        successCodes: validPayload.successCodes,
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
            res = responseHelper(400, { error: `The user already has the maximum number of checks (${maxChecks})` })

        return res;
    } catch (error) {
        return responseHelper(403, "")
    }
}

const updateChecksHandler = async(validData, id, token, verifyToken) => {
    let res;
    const { protocol, url, method, successCodes, timeoutSeconds } = validData;

    if (protocol || url || method || successCodes || timeoutSeconds) {
        const checkData = await _data.read('checks', id);
        const isTokenVerified = await verifyToken(checkData.userPhone, { token });
        isTokenVerified ?
            res = checkUpdater(checkData, validData, id) :
            res = responseHelper(403, "")
        return res;
    } else {
        return responseHelper(404, { error: 'Missing fields to update' })
    }
}

const checkUpdater = (checkData, validData, id) => {
    if (validData.protocol) {
        checkData.protocol = validData.protocol;
    }
    if (validData.url) {
        checkData.url = validData.url;
    }
    if (validData.method) {
        checkData.method = validData.method;
    }
    if (validData.successCodes) {
        checkData.successCodes = validData.successCodes;
    }
    if (validData.timeoutSeconds) {
        checkData.timeoutSeconds = validData.timeoutSeconds;
    }

    return _data.update('checks', id, checkData)
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
    //Checks - get
    //Required data : id
    //Optional data: none
    get: async(data, verifyToken) => {
        try {
            const id = typeof(data.queryStrObj.id) == 'string' && data.queryStrObj.id.trim().length > 0 ?
                data.queryStrObj.id.trim() : false;
            const checkData = await _data.read('checks', id);
            if (!await verifyToken(checkData.userPhone, data.headers))
                return responseHelper(403, { error: "Missing or invalid token" });

            return responseHelper(200, checkData);
        } catch (error) {
            return errorResponse("An error occured in checks get method", error)
        }
    },
    //Checks-Put
    //Required data : id
    //Optional data : protocol, url, method, successCodes, timeoutSeconds (one must be provided)
    put: async(data, verifyToken) => {
        try {
            let res;
            const { id } = data.payload;
            const ID = typeof(id) == 'string' && id.trim().length == 20 ?
                id.trim() : false;
            const validData = isPayloadValid(data.payload);
            ID ?
                res = await updateChecksHandler(validData, ID, data.headers.token, verifyToken) :
                res = responseHelper(400, { error: 'Missing required field' })

            return res;
        } catch (error) {
            return errorResponse("An error occurred in checks put method")
        }
    },
    delete: async data => {

    }
}