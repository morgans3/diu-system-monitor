import { settings } from "../../settings";

const { faker } = require("@faker-js/faker");
const AWSHelper = require("../classes/aws");

Cypress.Commands.add("getAccounts", async () => {
    try {
        const userData = {
            userData: {},
            adminUserData: {},
        };
        const userAccounts = JSON.parse(await AWSHelper.getSecrets("cypressaccounts"));
        // non admin user
        userData.userData.username = userAccounts.username;
        userData.userData.password = userAccounts.password;
        userData.userData.organisation = "Collaborative Partners";
        userData.userData.authentication = "Demo";
        // admin user
        userData.adminUserData.username = userAccounts.admin_username;
        userData.adminUserData.password = userAccounts.admin_password;
        userData.adminUserData.organisation = "Collaborative Partners";
        userData.adminUserData.authentication = "Demo";
        return userData;
    } catch (error) {
        console.error(error);
    }
});

Cypress.Commands.add("swaggerAuth", (jwttoken, page) => {
    cy.visit(page);
    // Find the auth button
    cy.get("button").contains("Authorize").click();
    // Find the input field and type the token
    cy.get(".auth-container input").type("JWT " + jwttoken);
    // Find the submit button and click it
    cy.get("button.btn.modal-btn.auth.authorize.button").contains("Authorize").click();
    cy.get("button.btn.modal-btn.auth.button").first().contains("Logout");
    cy.get("button.btn.modal-btn.auth.button.btn-done").contains("Close").click();
});

Cypress.Commands.add("getJWT", (userData) => {
    const requestConfig = {
        method: "post",
        url: settings.baseURL + "/users/authenticate",
        body: userData,
    };
    cy.request(requestConfig).then((response) => {
        expect(response.status).to.eq(200);
        if (response.body.token) {
            return response.body.token;
        }
    });
});

Cypress.Commands.add("getSwaggerData", (tag, testingEndpoint) => {
    let swaggerData = {};
    cy.request(settings.baseURL + "/swagggerjson").then((swagggerResponse) => {
        cy.expect(swagggerResponse.status).to.oneOf([200, 304]);
        if (swagggerResponse.body && swagggerResponse.body.paths) {
            const swagggerResponseData = swagggerResponse.body.paths;
            Object.keys(swagggerResponseData).forEach((endpoint) => {
                Object.keys(swagggerResponseData[endpoint]).forEach((requestType) => {
                    const APIInformation = swagggerResponseData[endpoint][requestType];
                    APIInformation["endpoint"] = endpoint;
                    APIInformation["requestType"] = requestType;
                    if (APIInformation.tags.includes(tag) && endpoint === testingEndpoint) {
                        swaggerData = APIInformation;
                    }
                });
            });
        }
        return swaggerData;
    });
});

Cypress.Commands.add("createFixture", (endpointData) => {
    const bodyParams = {};
    if (endpointData.parameters && endpointData.parameters.length) {
        endpointData.parameters.forEach((data) => {
            bodyParams[data.name] = fakerData(data);
        });
    }
    return bodyParams;
});

Cypress.Commands.add("createFailFixture", (endpointData) => {
    const bodyParams = {};
    if (endpointData.parameters && endpointData.parameters.length) {
        endpointData.parameters.forEach((data) => {
            bodyParams[data.name] = wrongFakerData(data);
        });
    }
    return bodyParams;
});

Cypress.Commands.add("getRandomString", (endpointData) => {
    return fakerData({ type: "sting", name: "string" });
});

Cypress.Commands.add("apiRequest", (endpointData, JWT, bodyParams, replaceData) => {
    const requestConfig = {
        method: endpointData.requestType,
        url: settings.baseURL + endpointData.endpoint,
        failOnStatusCode: false,
    };
    if (JWT) {
        requestConfig.headers = {
            Authorization: JWT,
        };
    }
    if (bodyParams) {
        requestConfig.body = bodyParams;
    }
    if (replaceData) {
        Object.keys(replaceData).forEach((find) => {
            const replace = replaceData[find];
            requestConfig.url = requestConfig.url.replace(find, replace);
        });
    }
    cy.request(requestConfig).then((response) => {
        return response;
    });
});

function fakerData(data) {
    switch (data.type) {
        case "integer":
        case "number":
            return faker.datatype.number().toString();
        case "boolean":
            return faker.datatype.boolean();
        case "date":
            return faker.date.recent();
        case "object": {
            const newData = {};
            const key = fakerData({ type: "string", name: "" });
            const value = fakerData({ type: "string", name: "" });
            newData['"' + key + '"'] = value;
            return newData;
        }
        case "array":
            return [];
        // return fakerData({ type: "string", name: "" }) + ", " + fakerData({ type: "string", name: "" });
        case "string":
        default:
            switch (data.name.toLowerCase()) {
                case "phone":
                case "phonenumber":
                    return faker.phone.phoneNumber();
                case "email":
                    return faker.internet.email();
                case "firstname":
                    return faker.name.firstName();
                case "lastname":
                    return faker.name.lastName();
                case "name":
                    return faker.name.firstName() + " " + faker.name.lastName();
                case "date":
                case "startdate":
                case "enddate":
                    return faker.date.recent();
                default:
                    return faker.lorem.word();
            }
    }
}

function wrongFakerData(data) {
    switch (data.type) {
        case "integer":
        case "number":
            return faker.datatype.boolean();
        case "boolean":
            return faker.datatype.number().toString();
        case "date": {
            const newData = {};
            const key = fakerData({ type: "string", name: "" });
            const value = fakerData({ type: "string", name: "" });
            newData['"' + key + '"'] = value;
            return newData;
        }
        case "object":
            return faker.date.recent();
        case "array":
            return faker.datatype.number().toString();
        case "string":
        default:
            return faker.datatype.boolean();
    }
}
