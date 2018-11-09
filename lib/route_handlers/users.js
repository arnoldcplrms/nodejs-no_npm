const _data = require('../data'),
    { hash } = require('../helpers'),
    { responseHelper, parseJsonToObject } = require('../helpers')

const createUser = async(validData) => {
    const hashedPassword = hash(validData.password)
    if (hashedPassword) {
        validData.password = hashedPassword;
        return _data.create('users', validData.phone, validData)
    } else {
        return responseHelper(500, { error: 'Could not hash the user\'s password' });
    }
}

const isDataValid = ({ payload }) => {
    let firstName = typeof(payload.firstName) == 'string' && payload.firstName.trim().length > 0 ?
        payload.firstName.trim() : false;

    let lastName = typeof(payload.lastName) == 'string' && payload.lastName.trim().length > 0 ?
        payload.lastName.trim() : false;

    let phone = typeof(payload.phone) == 'string' && payload.phone.trim().length == 10 ?
        payload.phone.trim() : false;

    let password = typeof(payload.password) == 'string' && payload.password.trim().length > 0 ?
        payload.password.trim() : false;

    let tosAgreement = typeof(payload.tosAgreement) == 'boolean' && payload.tosAgreement == true ?
        true : false;

    let isValid = (firstName && lastName && phone && password && tosAgreement);
    let returnObject;

    isValid ?
        returnObject = {
            firstName,
            lastName,
            phone,
            password,
            tosAgreement
        } :
        returnObject = false

    return returnObject;
}

module.exports = {
    post: async(data) => {
        const validData = isDataValid(data)
        if (validData) {
            let res;
            (await _data.read('users', validData.phone)) ?
            res = responseHelper(404, { error: 'A user with that phone number already exists.' }):
                res = await createUser(validData)

            return res;
        } else {
            return responseHelper(404, { error: 'Missing required fields' })
        }
    },
    get: async(data) => {
        let res;
        const { phone } = data.queryStrObj
        const phoneNum = typeof(phone) == 'string' && phone.trim().length == 10 ?
            phone.trim() : false;

        phoneNum ?
            res = await _data.read('users', phoneNum) :
            res = responseHelper(400, { error: "Missing required field" })

        delete res.password;
        return responseHelper(200, { payload: res })
    }
}