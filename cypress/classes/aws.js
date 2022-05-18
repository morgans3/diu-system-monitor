const SecretsManager = require("aws-sdk/clients/secretsmanager");
class Aws {
    static async getSecrets(secretName) {
        const credentials = Cypress.env();
        const clientparams = { region: credentials.AWSREGION || "eu-west-2" };
        if (credentials.aws_access_key_id && credentials.aws_secret_access_key) {
            clientparams["accessKeyId"] = credentials.aws_access_key_id;
            clientparams["secretAccessKey"] = credentials.aws_secret_access_key;
        }
        const client = new SecretsManager(clientparams);

        return new Promise((resolve, reject) => {
            client.getSecretValue({ SecretId: secretName }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    if ("SecretString" in data) {
                        resolve(data.SecretString);
                    } else {
                        resolve(Buffer.from(data.SecretBinary, "base64").toString("ascii"));
                    }
                }
            });
        });
    }
}

module.exports = Aws;
