import { _settings } from "../../settings";

const { faker } = require("@faker-js/faker");
const AWSHelper = require("../classes/aws");

Cypress.Commands.add("getAccounts", async () => {
    try {
        let userData = {
            userData: {},
            adminUserData: {},
        };
        const userAccounts = JSON.parse(await AWSHelper.getSecrets("cypressaccounts"));
        //non admin user
        userData.userData.username = userAccounts.username;
        userData.userData.password = userAccounts.password;
        userData.userData.organisation = "Collaborative Partners";
        userData.userData.authentication = "Demo";
        //admin user
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
    let requestConfig = {
        method: "post",
        url: _settings.baseURL + "/users/authenticate",
        body: userData,
    };
    cy.request(requestConfig).then((response) => {
        expect(response.status).to.eq(200);
        if (response.body.token) {
            return response.body.token;
        }
    });
});

Cypress.Commands.add("testEndpoint", (endpointData, JWT) => {
    let requestConfig = {
        method: endpointData.requestType,
        url: _settings.baseURL + endpointData.endpoint,
        headers: {
            authorization: JWT,
        },
    };
    if (endpointData.parameters && endpointData.parameters.length) {
        endpointData.parameters.forEach((parameter) => {
            let value;
            if (parameter.required) {
                console.log(parameter.type);
                switch (parameter.type) {
                    case "string":
                        value = "Lorem Ipsum";
                        break;
                    case "integer":
                        value = 123456;
                        break;
                    case "boolean":
                        value = true;
                        break;
                    case "array":
                        console.log(parameter);
                        break;
                }
            }
        });
    }
    // console.log(requestConfig);
    // cy.request(requestConfig).then((getAllResponse) => {
    //   console.log(endpointData.endpoint);
    //   console.log(getAllResponse);
    // });
});

Cypress.Commands.add("getAllFromEndpoint", (endpoint, containerID, jwtToken) => {
    let tryButtonSelector = containerID + " button.btn.try-out__btn";
    let executeButtonSelector = containerID + " button.btn.execute.opblock-control__btn";
    cy.intercept(endpoint).as("getAllData");
    cy.swaggerAuth(jwtToken, _settings.baseURL + "/api-docs");
    cy.get(containerID).click();
    cy.get(tryButtonSelector).click();
    cy.get(executeButtonSelector)
        .click()
        .wait("@getAllData")
        .then((interceptedData) => {
            return interceptedData;
        });
});

Cypress.Commands.add("testDataKeys", (data, keys) => {
    expect(data).to.be.an("array");
    data.forEach((userProfile) => {
        keys.forEach((key) => {
            expect(userProfile).to.have.property(key);
        });
    });
});

Cypress.Commands.add("getAll", (endpoint, containerID, keys) => {
    cy.getJWT().then((jwtToken) => {
        cy.getAllFromEndpoint(endpoint, containerID, jwtToken).then((data) => {
            if (data.body) {
                let responseData = JSON.parse(data.body);
                if (responseData && responseData.length && keys) {
                    cy.testDataKeys(responseData, keys);
                }
                return responseData;
            }
        });
    });
});

Cypress.Commands.add("registration", (endpoint, containerID, fixture) => {
    let tryButtonSelector = containerID + " button.btn.try-out__btn";
    let executeButtonSelector = containerID + " button.btn.execute.opblock-control__btn";
    cy.getJWT().then((jwtToken) => {
        cy.swaggerAuth(jwtToken, _settings.baseURL + "/api-docs");
        cy.intercept(endpoint).as("registerUser");
        cy.get(containerID).click();
        cy.get(tryButtonSelector).click();
        cy.fillFormFromFixture(containerID, fixture);
        cy.get(executeButtonSelector)
            .click()
            .wait("@registerUser")
            .then((interceptedData) => {
                cy.log(interceptedData.response.body);
                expect(interceptedData.response.statusCode).to.eq(200);
                return interceptedData.response.body;
            });
    });
});

Cypress.Commands.add("selectUser", (endpoint, containerID, userProfile) => {
    let tryButtonSelector = containerID + " button.btn.try-out__btn";
    let executeButtonSelector = containerID + " button.btn.execute.opblock-control__btn";
    cy.getJWT().then((jwtToken) => {
        cy.log(jwtToken);
        cy.swaggerAuth(jwtToken, _settings.baseURL + "/api-docs");
        cy.intercept(endpoint).as("getProfileByUser");
        cy.get(containerID).click();
        cy.get(tryButtonSelector).click();
        cy.fillFormFromFixture(containerID, userProfile);
        cy.get(executeButtonSelector)
            .click()
            .wait("@getProfileByUser")
            .then((interceptedData) => {
                cy.log(interceptedData.response.body);
                expect(interceptedData.response.statusCode).to.eq(200);
                return interceptedData.response;
            });
    });
});

Cypress.Commands.add("fillFormFromFixture", (containerID, fixture) => {
    if (fixture) {
        cy.get(containerID).then((container) => {
            Object.keys(fixture).forEach((key) => {
                let selector = "input[placeholder='" + key + "']";
                if (container.find(selector).length > 0) {
                    const largeSelector = containerID + " " + selector;
                    cy.get(largeSelector).type(fixture[key]);
                }
            });
        });
    }
});

Cypress.Commands.add("testGetAll", (endpointData, JWT) => {
    if (endpointData.parameters && endpointData.parameters.length) {
        endpointData.parameters.forEach((parameter) => {
            if (parameter.name == "Limit") {
                endpointData.endpoint = endpointData.endpoint.replace("{limit}", "10");
            }
        });
    }
    let requestConfig = {
        method: endpointData.requestType,
        url: _settings.baseURL + endpointData.endpoint,
        headers: {
            Authorization: JWT,
        },
    };
    if (
        !requestConfig.url.includes("patientlists") &&
        !requestConfig.url.includes("postcodes") &&
        !requestConfig.url.includes("shielding") &&
        !requestConfig.url.includes("requests") &&
        !requestConfig.url.includes("virtualward")
    ) {
        cy.request(requestConfig).then((response) => {
            return response;
        });
    }
});

Cypress.Commands.add("testCreate", (endpointData, JWT) => {
    if (endpointData.parameters && endpointData.parameters.length) {
        let bodyParams = {};
        endpointData.parameters.forEach((data) => {
            bodyParams[data.name] = fakerData(data);
        });
        let requestConfig = {
            method: endpointData.requestType,
            url: _settings.baseURL + endpointData.endpoint,
            headers: {
                Authorization: JWT,
            },
            body: bodyParams,
        };
        if (
            !requestConfig.url.includes("links/create") &&
            !requestConfig.url.includes("roles/create") &&
            !requestConfig.url.includes("mfa/create") &&
            !requestConfig.url.includes("teams/create") &&
            !requestConfig.url.includes("capabilities/create") &&
            !requestConfig.url.includes("/roles/create") &&
            !requestConfig.url.includes("/roles/links/create") &&
            !requestConfig.url.includes("/mfa/create") &&
            !requestConfig.url.includes("users/create")
        ) {
            console.log("requestConfig");
            console.log(requestConfig);
            cy.request(requestConfig).then((response) => {
                return response;
            });
        } else {
            return "Endpoint requires attention";
        }
    } else {
        return "Error: no test data";
    }
});

Cypress.Commands.add("getSwaggerData", (tag, testingEndpoint) => {
    let swaggerData = {};
    cy.request(_settings.baseURL + "/swagggerjson").then((swagggerResponse) => {
        cy.expect(swagggerResponse.status).to.oneOf([200, 304]);
        if (swagggerResponse.body && swagggerResponse.body.paths) {
            let swagggerResponseData = swagggerResponse.body.paths;
            Object.keys(swagggerResponseData).forEach((endpoint) => {
                Object.keys(swagggerResponseData[endpoint]).forEach((requestType) => {
                    let APIInformation = swagggerResponseData[endpoint][requestType];
                    APIInformation["endpoint"] = endpoint;
                    APIInformation["requestType"] = requestType;
                    if (APIInformation.tags.includes(tag) && endpoint == testingEndpoint) {
                        swaggerData = APIInformation;
                    }
                });
            });
        }
        return swaggerData;
    });
});

Cypress.Commands.add("getAll", (endpointData, JWT) => {
    let requestConfig = {
        method: endpointData.requestType,
        url: _settings.baseURL + endpointData.endpoint,
        failOnStatusCode: false,
    };
    if (JWT) {
        requestConfig.headers = {
            Authorization: JWT,
        };
    }
    cy.request(requestConfig).then((response) => {
        return response;
    });
});

Cypress.Commands.add("getByID", (endpointData, JWT, id) => {
    let requestConfig = {
        method: endpointData.requestType,
        url: _settings.baseURL + endpointData.endpoint,
        failOnStatusCode: false,
    };
    if (JWT) {
        requestConfig.headers = {
            Authorization: JWT,
        };
    }
    requestConfig.url = requestConfig.url.replace("{id}", id);
    cy.request(requestConfig).then((response) => {
        return response;
    });
});

Cypress.Commands.add("createFixture", (endpointData) => {
    console.log(endpointData);
    let bodyParams = {};
    if (endpointData.parameters && endpointData.parameters.length) {
        endpointData.parameters.forEach((data) => {
            bodyParams[data.name] = fakerData(data);
        });
    }
    console.log(bodyParams);
    return bodyParams;
});

Cypress.Commands.add("createFailFixture", (endpointData) => {
    console.log(endpointData);
    let bodyParams = {};
    if (endpointData.parameters && endpointData.parameters.length) {
        endpointData.parameters.forEach((data) => {
            bodyParams[data.name] = wrongFakerData(data);
        });
    }
    console.log(bodyParams);
    return bodyParams;
});

Cypress.Commands.add("getRandomString", (endpointData) => {
    return fakerData({ type: "sting", name: "string" });
});

Cypress.Commands.add("create", (endpointData, JWT, bodyParams) => {
    let requestConfig = {
        method: endpointData.requestType,
        url: _settings.baseURL + endpointData.endpoint,
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
    console.log(requestConfig);
    cy.request(requestConfig).then((response) => {
        console.log(response);
        return response;
    });
});

Cypress.Commands.add("update", (endpointData, JWT, bodyParams) => {
    let requestConfig = {
        method: endpointData.requestType,
        url: _settings.baseURL + endpointData.endpoint,
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
    console.log(requestConfig);
    cy.request(requestConfig).then((response) => {
        console.log(response);
        return response;
    });
});

Cypress.Commands.add("delete", (endpointData, JWT, bodyParams) => {
    let requestConfig = {
        method: endpointData.requestType,
        url: _settings.baseURL + endpointData.endpoint,
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
    console.log(requestConfig);
    cy.request(requestConfig).then((response) => {
        console.log(response);
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
        case "object":
            let newData = {};
            let key = fakerData({ type: "string", name: "" });
            let value = fakerData({ type: "string", name: "" });
            newData['"' + key + '"'] = value;
            return newData;
        case "array":
            return [];
            return fakerData({ type: "string", name: "" }) + ", " + fakerData({ type: "string", name: "" });
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
        case "date":
            let newData = {};
            let key = fakerData({ type: "string", name: "" });
            let value = fakerData({ type: "string", name: "" });
            newData['"' + key + '"'] = value;
            return newData;
        case "object":
            return faker.date.recent();
        case "array":
            return faker.datatype.number().toString();
        case "string":
        default:
            return faker.datatype.boolean();
            break;
    }
}
