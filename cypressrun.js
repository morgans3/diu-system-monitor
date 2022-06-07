const cy2 = require("cy2");
const fs = require("fs");
const https = require("https");
const { settings } = require("./settings");
const createFixtures = require("./create-fixtures").createFixtureData;
const testServerURL = process.env.TEST_SERVER_URL || "http://localhost:1234/";

(async () => {
    require("dotenv").config();
    const AWSHelper = require("diu-data-functions").Helpers.Aws;
    try {
        const credentials = JSON.parse(await AWSHelper.getSecrets("cypressaccounts"));
        fs.writeFileSync("./cypress/fixtures/cypressaccounts.json", JSON.stringify(credentials));

        const jwtCredentials = JSON.parse(await AWSHelper.getSecrets("jwt"));
        fs.writeFileSync("./cypress/fixtures/jwtCredentials.json", JSON.stringify(jwtCredentials));

        const awsCredentials = JSON.parse(await AWSHelper.getSecrets("awsdev"));
        process.env.AWS_SECRETID = awsCredentials.secretid;
        process.env.AWS_SECRETKEY = awsCredentials.secretkey;

        await require("./configuration").configureApis();

        const options = {
            hostname: settings.baseURL.replace("https://", ""),
            port: 443,
            method: "GET",
            path: "/swagggerjson",
        };
        const req = https.request(options, (res) => {
            res.setEncoding("utf8");
            let body = "";
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                fs.writeFileSync("./cypress/fixtures/swagggerjson.json", body);
                createFixtures(body);
                cy2.run(testServerURL, "cy2").then(() => {
                    console.log("Setup complete. Proceeding with Cypress...");
                });
            });
            res.on("error", () => {
                console.log("Error: " + res.statusCode);
            });
        });

        req.end();
    } catch (error) {
        console.error(error);
    }
})();
