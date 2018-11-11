const _data = require('../data'),
    { hash } = require('../helpers'),
    { responseHelper, errorResponse } = require('../helpers')

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

const isDataToUpdateValid = ({ payload }) => {
    let firstName = typeof(payload.firstName) == 'string' && payload.firstName.trim().length > 0 ?
        payload.firstName.trim() : false;

    let lastName = typeof(payload.lastName) == 'string' && payload.lastName.trim().length > 0 ?
        payload.lastName.trim() : false;

    let password = typeof(payload.password) == 'string' && payload.password.trim().length > 0 ?
        payload.password.trim() : false;

    return {
        firstName,
        lastName,
        password
    }
}

const updateUser = async(dataToUpdate, phone) => {
    let res;
    const { firstName, lastName, password } = dataToUpdate;

    (firstName || lastName || password) ?
    res = await dataToUpdateHandler(dataToUpdate, phone):
        res = responseHelper(400, { error: "Missing fields to update" });

    return res;
}

const dataToUpdateHandler = async(dataToUpdate, phone) => {
    try {
        const { firstName, lastName, password } = dataToUpdate;
        const userData = await _data.read('users', phone);

        if (firstName) {
            userData.firstName = firstName;
        }
        if (lastName) {
            userData.lastName = lastName;
        }
        if (password) {
            userData.hashedPassword = hash(password)
        }
        return await _data.update('users', phone, userData)
    } catch (error) {
        return errorResponse("Error in updating user data", error)
    }
}

module.exports = {
    post: async(data) => {
        try {
            const validData = isDataValid(data)
            if (validData) {
                let res;
                (await _data.read('users', validData.phone)) ?
                res = await createUser(validData):
                    res = responseHelper(404, { error: 'A user with that phone number already exists.' });

                return res;
            } else {
                return responseHelper(404, { error: 'Missing required fields' })
            }
        } catch (error) {
            return errorResponse('An error occured in users post method', error)
        }
    },
    get: async(data, isTokenVerified = null) => {
        try {
            if (!await isTokenVerified(data.queryStrObj.phone, data.headers))
                return responseHelper(403, { error: "Missing or invalid token" });

            let res;
            const { phone } = data.queryStrObj
            const phoneNum = typeof(phone) == 'string' && phone.trim().length == 10 ?
                phone.trim() : false;

            phoneNum ?
                res = await _data.read('users', phoneNum) :
                res = false

            if (res) {
                delete res.password;
                return responseHelper(200, res)
            } else {
                return responseHelper(400, { error: "Missing required field" })
            }
        } catch (error) {
            return errorResponse('An error occured in users get method', error)
        }
    },
    put: async(data, isTokenVerified = null) => {
        try {
            if (!await isTokenVerified(data.queryStrObj.phone, data.headers))
                return responseHelper(403, { error: "Missing or invalid token" });

            let res;
            const { phone } = data.payload;
            const phoneNum = typeof(phone) == 'string' && phone.trim().length == 10 ?
                phone.trim() : false;
            phoneNum ?
                res = await updateUser(isDataToUpdateValid(data), phone) :
                res = responseHelper(404, { error: "No user found" })

            return res;
        } catch (error) {
            return errorResponse('An error occured in users put method', error)
        }
    },
    delete: async(data, isTokenVerified = null) => {
        try {
            if (!await isTokenVerified(data.queryStrObj.phone, data.headers))
                return responseHelper(403, { error: "Missing or invalid token" });

            let res;
            const { phone } = data.queryStrObj
            const phoneNum = typeof(phone) == 'string' && phone.trim().length == 10 ?
                phone.trim() : false;

            phoneNum ?
                res = await _data.delete('users', phoneNum) :
                res = responseHelper(400, { error: "Missing required field" })

            return res;
        } catch (error) {
            return errorResponse('An error occured in users delete method', error)
        }
    }
}