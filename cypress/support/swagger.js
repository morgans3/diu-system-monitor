import { settings } from "../../settings";

Cypress.Commands.add("swaggerAuth", (jwttoken, page) => {
    cy.visit(page);
    cy.get("button").contains("Authorize").click();
    cy.get(".auth-container input").type("JWT " + jwttoken);
    cy.get("button.btn.modal-btn.auth.authorize.button").contains("Authorize").click();
    cy.get("button.btn.modal-btn.auth.button").first().contains("Logout");
    cy.get("button.btn.modal-btn.auth.button.btn-done").contains("Close").click();
});

Cypress.Commands.add("getJWT", (userData) => {
    const requestConfig = {
        method: "post",
        url: settings.apiURL + "/users/authenticate",
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
    cy.fixture("secrets/swagggerjson").then((swagggerResponse) => {
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

Cypress.Commands.add("apiRequest", (endpointData, Authorization, bodyParams, replaceData) => {
    const requestConfig = {
        method: endpointData.requestType,
        url: settings.apiURL + endpointData.endpoint,
        failOnStatusCode: false,
    };
    if (Authorization) requestConfig.headers = { Authorization };
    if (bodyParams) requestConfig.body = bodyParams;

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

// TODO: Do we need three api request methods?

Cypress.Commands.add("apiGetByParamsRequest", (endpointData, JWT, getAllEndpoint) => {
    const requestConfig = {
        method: endpointData.requestType,
        url: settings.apiURL + endpointData.endpoint,
        failOnStatusCode: false,
    };
    const getAllRequestConfig = {
        method: getAllEndpoint.requestType,
        url: settings.apiURL + getAllEndpoint.endpoint,
        failOnStatusCode: false,
    };
    if (JWT) {
        requestConfig.headers = {
            Authorization: JWT,
        };
        getAllRequestConfig.headers = {
            Authorization: JWT,
        };
    }
    cy.request(getAllRequestConfig).then((getAllResponse) => {
        expect(getAllResponse.status).to.oneOf(200);
        let responseBody = getAllResponse.body;
        if (typeof getAllResponse.body === "string") {
            responseBody = JSON.parse(getAllResponse.body);
        }
        requestConfig.url = getReplacementUrl(responseBody, requestConfig.url);
        cy.request(requestConfig).then((response) => {
            console.log(response);
        });
    });
});

Cypress.Commands.add("apiGetByParamsBadRequest", (endpointData, JWT) => {
    const requestConfig = {
        method: endpointData.requestType,
        url: settings.apiURL + endpointData.endpoint,
        failOnStatusCode: false,
    };
    if (JWT) {
        requestConfig.headers = {
            Authorization: JWT,
        };
    }
    requestConfig.url = getBadReplacementUrl(requestConfig.url);
    cy.request(requestConfig).then((response) => {
        console.log(response);
    });
});

// TODO: Logic? Why is it looping through all responses?
function getReplacementUrl(responseBody, url) {
    responseBody.forEach((response) => {
        const rxp = /{([^}]+)}/g;
        let curMatch;
        const foundReplacements = [];
        while ((curMatch = rxp.exec(url))) {
            foundReplacements.push(curMatch[1]);
        }
        foundReplacements.forEach((replacement) => {
            const find = "{" + replacement + "}";
            let replacementString = replacement;
            if (replacement === "code") {
                replacementString = "teamcode";
            }
            if (replacement === "userId") {
                replacementString = "_id";
            }
            if (replacement === "id" && url.indexOf("/teamrequests/") !== -1) {
                replacementString = "_id";
            }
            if (replacement === "id" && url.indexOf("/teammembers/") !== -1) {
                replacementString = "_id";
            }
            if (replacement === "user") {
                replacementString = "username#org";
            }
            const replace = response[replacementString];
            url = url.replace(find, replace);
            if (url.indexOf("#") !== -1) {
                url = url.replace("#", "%23");
            }
        });
    });
    return url;
}

function getBadReplacementUrl(url) {
    const rxp = /{([^}]+)}/g;
    let curMatch;
    const foundReplacements = [];
    while ((curMatch = rxp.exec(url))) {
        foundReplacements.push(curMatch[1]);
    }
    foundReplacements.forEach((replacement) => {
        const find = "{" + replacement + "}";
        const replace = "BGanzCcSAtooEMakr6UjN8rUzRmrCA";
        url = url.replace(find, replace);
    });
    return url;
}
