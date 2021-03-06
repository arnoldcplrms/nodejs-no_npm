var environments = {};

environments.staging = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: "staging",
    hashingSecret: "thisIsASecret",
    maxChecks: 5
};

environments.production = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: "production",
    hashingSecret: "thisIsAlsoASecret",
    maxChecks: 5
};

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ?
    environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;