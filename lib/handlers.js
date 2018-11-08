const _data = require('./data');
const helpers = require('./helpers')

const _users = {
    post: async(data) => {
        try {
            const validData = isDataValid(data)
            if (validData) {
                let res;
                !(await _data.readFile('users', validData.phone)) ?
                res = Promise.resolve(true):
                    res = Promise.reject('A user with that phone number already exists.');

                return res;
            } else {
                return Promise.reject({
                    error: 'Missing required fields'
                })
            }
        } catch (error) {
            return Promise.reject(error.message)
        }
    }
}
const createUser = async(validData) => {
    try {
        const hashedPassword = helpers.hash(validData.password)
        if (hashedPassword) {
            validData.password = hashedPassword;
            await _data.create('users', phone, validData)
            console.log('User created successfuly');
        } else {
            return Promise.reject('Could not has the user\'s password');
        }
    } catch (error) {
        console.log(error);
        return Promise.reject(error.message)
    }
}
const isDataValid = (data) => {
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ?
        data.payload.firstName.trim() : false;

    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ?
        data.payload.lastName.trim() : false;

    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ?
        data.payload.phone.trim() : false;

    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ?
        data.payload.password.trim() : false;

    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ?
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
                await _users[data.method](data);
                return helpers.responseHelper(200, { message: "User created" });
            } else {
                return helpers.responseHelper(405, { error: "Method not allowed" });
            }
        } catch (error) {
            return Promise.reject(500)
        }
    }
}