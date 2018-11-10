const {
    responseHelper,
    errorResponse,
    hash,
    createRandomString
} = require('../helpers')
const _data = require('../data')

const validatePhonePassword = ({ payload }) => {
    let res;
    let phone = typeof(payload.phone) == 'string' && payload.phone.trim().length > 0 ?
        payload.phone.trim() : false;
    let password = typeof(payload.password) == 'string' && payload.password.trim().length > 0 ?
        payload.password.trim() : false;

    phone && password ?
        res = { phone, password } :
        res = false

    return res;
}

const setToken = async(validData, userData) => {
    let res;
    (hash(validData.password) == userData.password) ?
    res = await tokenDataHandler(validData):
        res = responseHelper(400, { error: "Password did not match the specified user\'s stored password" })

    return res
}

const tokenDataHandler = async(validData) => {
    const tokenId = createRandomString(20);
    const tokenObject = {
        phone: validData.phone,
        id: tokenId,
        expires: Date.now() + 1000 * 60 * 60
    }
    await _data.create('tokens', tokenId, tokenObject);
    return tokenObject;
}

const updateToken = async(id) => {
    const tokenData = await _data.read('tokens', id);
    if (tokenData.expires > Date.now()) {
        tokenData.expires = Date.now() + 1000 * 60 * 60;
        await _data.update('tokens', id, tokenData)
        return responseHelper(200, "Token updated successfuly.")
    } else {
        return responseHelper(400, "Token already expired, and cannot be extended")
    }
}

module.exports = {
    post: async data => {
        try {
            let res;
            const validData = validatePhonePassword(data);
            validData ?
                res = await setToken(validData, await _data.read('users', validData.phone)) :
                res = responseHelper(400, { error: "Missing required fields" })

            return responseHelper(200, { payload: res });
        } catch (error) {
            return errorResponse('An error occurred in tokens post method', error)
        }
    },
    get: async data => {
        try {
            let res;
            const { id } = data.queryStrObj
            const ID = typeof(id) == 'string' && id.trim().length == 20 ?
                id.trim() : false;

            ID ?
                res = await _data.read('tokens', ID) :
                res = false

            return res ?
                responseHelper(200, res) :
                responseHelper(404, { error: "Id not found" })
        } catch (error) {
            return errorResponse('An error occured in users get method', error)
        }
    },
    put: async data => {
        try {
            let res;
            const { id, extend } = data.payload
            const _id = typeof(id) == 'string' && id.trim().length == 20 ?
                id.trim() : false;
            const _extend = typeof(extend) == 'boolean' && extend == true ?
                true : false;

            (_id && _extend) ? res = await updateToken(_id): res = false

            return res ?
                responseHelper(200, res) :
                responseHelper(404, "Field(s) are invalid")
        } catch (error) {
            return errorResponse('An error occured in tokens put method', error);
        }
    },
    delete: async data => {
        try {
            let res;
            const { id } = data.queryStrObj
            const _id = typeof(id) == 'string' && id.trim().length == 20 ?
                id.trim() : false;

            _id ?
                res = await _data.delete('tokens', _id) :
                res = responseHelper(400, { error: "Missing required field" })

            return res;
        } catch (error) {
            return errorResponse('An error occured in users delete method', error)
        }
    },
    verifyToken: async(phone, headers) => {
        try {
            let tokenId = typeof(headers.token) == 'string' ? headers.token : false
            let res;
            const tokenData = _data.read('tokens', tokenId);
            (tokenData.phone == phone && tokenData.expires > Date.now()) ?
            res = true: res = false

            return res;
        } catch (error) {
            return errorResponse("An error occured in verifying token.", error)
        }
    }
}