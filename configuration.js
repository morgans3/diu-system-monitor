const DIULibrary = require("diu-data-functions").Methods.DynamoDBData;
const AWS = require("./database").AWS;
const uuid = require("uuid");
let loadedConfiguration = null;
const fs = require("fs");

const getConfigurationFromDatabase = async (callback) => {
    DIULibrary.getItemByKey(AWS, "atomic_payload", "id", "apisettings", (err, results) => {
        if (err) {
            callback(err);
        } else {
            if (results.Items.length > 0) {
                loadedConfiguration = results.Items[0].config;
                callback(null, loadedConfiguration);
            } else {
                callback(null, null);
            }
        }
    });
};

const returnLoadedConfig = () => {
    return loadedConfiguration;
};

let securegroup = [];

const getSecurityGroup = () => {
    return securegroup;
};

const configureServiceAccounts = async (services) => {
    securegroup = [];
    const AWSHelper = require("diu-data-functions").Helpers.Aws;
    const credentials = JSON.parse(await AWSHelper.getSecrets("serviceaccounts"));
    services.forEach((org) => {
        if (org === "Service" && credentials[org]) {
            const govukJSON = {
                org,
                key: credentials[org],
            };
            fs.writeFileSync("./cypress/fixtures/govuk.json", JSON.stringify(govukJSON));
        }
        securegroup.push({ org, key: credentials[org] || null });
    });
    fs.writeFileSync("./cypress/fixtures/serviceaccounts.json", JSON.stringify(securegroup));
};

module.exports = {
    returnLoadedConfig,
    getConfigurationFromDatabase,
    getSecurityGroup,
    configureApis: async () => {
        const AWSHelper = require("diu-data-functions").Helpers.Aws;

        await getConfigurationFromDatabase(async (err, configuration) => {
            if (err) {
                console.log("ERROR: " + JSON.stringify(err));
                throw err;
            } else {
                process.env.GOVUKKEY = uuid.v1(); // Default to unreadable random key;
                if (configuration.serviceaccounts) {
                    await configureServiceAccounts(configuration.serviceaccounts);
                }
                configuration.configuration.forEach(async (api) => {
                    try {
                        const credentials = JSON.parse(await AWSHelper.getSecrets(api.secretName));
                        const secrets = [];
                        api.secrets.forEach((secret) => {
                            const key = Object.keys(secret)[0];
                            const obj = {};
                            obj[key] = credentials[secret[key]];
                            secrets.push(obj);
                        });
                        fs.writeFileSync("./cypress/fixtures/" + api.secretName + ".json", JSON.stringify(secrets));
                        console.log("Loaded configuration for: " + api.configName);
                    } catch (e) {
                        console.error("Could not configure " + api.configName + " settings");
                    }
                });
            }
        });

        return "Configured Application";
    },
};
