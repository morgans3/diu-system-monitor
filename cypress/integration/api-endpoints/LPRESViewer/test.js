const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
const JWTs = {
    userJWT: "",
};

before(() => {
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("secrets/cypressaccounts").then((userDetails) => {
        const userData = {
            username: userDetails.username,
            password: userDetails.password,
            organisation: "Collaborative Partners",
            authentication: "Demo",
        };
        cy.getJWT(userData).then((jwtToken) => {
            JWTs.userJWT = "JWT " + jwtToken;
        });
    });
});

describe("Test Setup", () => {
    it("Is Swagger Data available?", () => {
        expect(swaggerResponse.length).to.be.at.least(1);
    });
    it("User Token is available to use", () => {
        cy.expect(JWTs.userJWT.length).to.be.at.least(1);
    });
});

describe("Test Endpoints and basic Security", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("LPRESViewer");
        });
        cy.expect(endpoints.length).to.be.at.least(1);
    });

    it("Check if endpoints are valid", () => {
        endpoints.forEach((endpoint) => {
            cy.expect(endpoint.endpoint).to.be.a("string");
            cy.expect(endpoint.requestType).to.be.a("string");
        });
    });

    it("Check endpoint for 401 status", () => {
        endpoints.forEach((endpoint) => {
            if (endpoint.security) {
                cy.apiRequest(endpoint, null).then((response) => {
                    cy.expect(response.status).to.be.equal(401);
                });
            }
        });
    });
});

describe("Test Generate Key Method", () => {
    it("Check method success 200", () => {
        const newendpoint = "/lpresviewer/generate-validation-key/";
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT, { nhsnumber: "0123456789" }).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check method bad request 400", () => {
        const newendpoint = "/lpresviewer/generate-validation-key/";
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });
});
