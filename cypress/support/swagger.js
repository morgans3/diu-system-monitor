import { settings } from "../../settings";

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

Cypress.Commands.add("getSwaggerData", () => {
    const swaggerData = [];
    cy.fixture("swagggerjson").then((swagggerResponse) => {
        if (swagggerResponse && swagggerResponse.paths) {
            const swagggerResponseData = swagggerResponse.paths;
            Object.keys(swagggerResponseData).forEach((endpoint) => {
                Object.keys(swagggerResponseData[endpoint]).forEach((requestType) => {
                    const APIInformation = swagggerResponseData[endpoint][requestType];
                    APIInformation["endpoint"] = endpoint;
                    APIInformation["requestType"] = requestType;
                    swaggerData.push(APIInformation);
                });
            });
        }
        return swaggerData;
    });
});

Cypress.Commands.add("getSwaggerDataOld", (tag, testingEndpoint) => {
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

function whatToExpect(statuscode) {
    switch (statuscode) {
        case "200":
            return [200, 304];
        default:
            return [parseInt(statuscode)];
    }
}

Cypress.Commands.add("testEndpointResponse", (responseStatus, objSwaggerData, JWTs, bodyParams, replaceData) => {
    let JWT = "";
    switch (responseStatus) {
        case "200":
            if (objSwaggerData.security && objSwaggerData.security.length > 0) {
                JWT = JWTs.adminJWT;
            }
            cy.log(objSwaggerData);
            cy.log(JWT);
            cy.log(bodyParams);
            cy.log(replaceData);
            console.log(objSwaggerData);
            console.log(JWT);
            console.log(bodyParams);
            console.log(replaceData);
            cy.apiRequest(objSwaggerData, JWT, bodyParams.bodyParams, replaceData.passReplaceData).then((testResponse) => {
                cy.expect(testResponse.status).to.oneOf(whatToExpect(responseStatus));
                return testResponse;
            });
            break;
        case "401":
            cy.log(objSwaggerData);
            cy.log(JWT);
            cy.log(bodyParams);
            cy.log(replaceData);
            console.log(objSwaggerData);
            console.log(JWT);
            console.log(bodyParams);
            console.log(replaceData);
            cy.apiRequest(objSwaggerData, JWT, bodyParams.bodyParams, replaceData.passReplaceData).then((testResponse) => {
                cy.expect(testResponse.status).to.oneOf(whatToExpect(responseStatus));
                return testResponse;
            });
            break;
        case "403":
            if (objSwaggerData.security && objSwaggerData.security.length > 0) {
                JWT = JWTs.userJWT;
            }
            cy.log(objSwaggerData);
            cy.log(JWT);
            cy.log(bodyParams);
            cy.log(replaceData);
            console.log(objSwaggerData);
            console.log(JWT);
            console.log(bodyParams);
            console.log(replaceData);
            cy.apiRequest(objSwaggerData, JWT, bodyParams.bodyParams, replaceData.passReplaceData).then((testResponse) => {
                cy.expect(testResponse.status).to.oneOf(whatToExpect(responseStatus));
                return testResponse;
            });
            break;
        case "400":
            if (objSwaggerData.security && objSwaggerData.security.length > 0) {
                JWT = JWTs.adminJWT;
            }
            cy.log(objSwaggerData);
            cy.log(JWT);
            cy.log(bodyParams);
            cy.log(replaceData);
            console.log(objSwaggerData);
            console.log(JWT);
            console.log(bodyParams);
            console.log(replaceData);
            cy.apiRequest(objSwaggerData, JWT, bodyParams.bodyParamsBadPayload, replaceData.passReplaceData).then((testResponse) => {
                cy.expect(testResponse.status).to.oneOf(whatToExpect(responseStatus));
                return testResponse;
            });
            break;
        case "404":
            if (objSwaggerData.security && objSwaggerData.security.length > 0) {
                JWT = JWTs.adminJWT;
            }
            cy.log(objSwaggerData);
            cy.log(JWT);
            cy.log(bodyParams);
            cy.log(replaceData);
            console.log(objSwaggerData);
            console.log(JWT);
            console.log(bodyParams);
            console.log(replaceData);
            bodyParams.bodyParams = create404FromParameters(bodyParams.bodyParams);
            console.log(bodyParams);
            cy.apiRequest(objSwaggerData, JWT, bodyParams.bodyParams, replaceData.failReplaceData).then((testResponse) => {
                cy.expect(testResponse.status).to.oneOf(whatToExpect(responseStatus));
                return testResponse;
            });
            break;
    }
});

function create404FromParameters(bodyParams) {
    Object.keys(bodyParams).forEach((parameter) => {
        if (parameter !== "teamcode" && parameter !== "code") {
            bodyParams[parameter] += "1";
        }
    });
    return bodyParams;
}
