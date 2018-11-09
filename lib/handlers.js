const _data = require('./data');
const helpers = require('./helpers')

const _users = {
    post: async(data) => {
        const validData = isDataValid(data)
        if (validData) {
            let res;

            (await _data.readFile('users', validData.phone)) ?
            res = helpers.responseHelper(404, { error: 'A user with that phone number already exists.' }):
                res = await createUser(validData)

            return res;
        } else {
            return helpers.responseHelper(404, {
                error: 'Missing required fields'
            })
        }
    }
}

const createUser = async(validData) => {
    const hashedPassword = helpers.hash(validData.password)
    if (hashedPassword) {
        validData.password = hashedPassword;
        await _data.create('users', validData.phone, validData)
        return helpers.responseHelper(200, {})
    } else {
        return Promise.reject('Could not has the user\'s password');
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

    let isValid = (firstName && lastName && phone && password && tosAgreement)
    let returnObject;

    isValid ? returnObject = {
            firstName,
            lastName,
            phone,
            password,
            tosAgreement
        } :
        returnObject = false
    console.log(firstName, lastName, phone, password, tosAgreement);
    console.log(isValid, returnObject);
    return returnObject;
}


module.exports = {
    ping: (data, callback) => {
        callback(200);
    },
    notFound: (data, callback) => {
        callback(404)
    },
    users: async(data) => {
        try {
            const acceptableMethods = ['post', 'put', 'get', 'delete']
            if (acceptableMethods.indexOf(data.method) > -1) {
                return await _users[data.method](data);
            } else {
                return helpers.responseHelper(405, { error: "Method not allowed" });
            }
        } catch (error) {
            return helpers.responseHelper(500, { error: error });
        }
    }
}