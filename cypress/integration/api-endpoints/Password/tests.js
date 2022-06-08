const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let swaggerResponse;
let endpoints;
const JWTs = {
    userJWT: "",
    username: "",
    password: "",
};

before(() => {
    // Act
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("secrets/cypressaccounts").then((userDetails) => {
        JWTs.username = userDetails.username;
        JWTs.password = userDetails.password;
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

describe("Test Endpoint basics", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("Password");
        });
        cy.expect(endpoints.length).to.be.at.least(1);
    });

    it("Check if endpoints are valid", () => {
        endpoints.forEach((endpoint) => {
            cy.expect(endpoint.endpoint).to.be.a("string");
            cy.expect(endpoint.requestType).to.be.a("string");
        });
    });

    it("Check endpoint for 400 status", () => {
        endpoints.forEach((endpoint) => {
            if (endpoint.requestType === "put") {
                cy.apiRequest(endpoint, null, {}).then((response) => {
                    cy.expect(response.status).to.be.equal(400);
                });
            }
        });
    });

    it("Check endpoint for 400 status", () => {
        endpoints.forEach((endpoint) => {
            if (endpoint.requestType === "put") {
                cy.apiRequest(endpoint, null, { authmethod: "NotDemo" }).then((response) => {
                    cy.expect(response.status).to.be.equal(400);
                });
            }
        });
    });

    it("Check endpoint for 200 status", () => {
        endpoints.forEach((endpoint) => {
            cy.apiRequest(endpoint, JWTs.userJWT, { username: JWTs.username, authmethod: "Demo", newpassword: JWTs.password }).then(
                (response) => {
                    cy.expect(response.status).to.be.equal(200);
                }
            );
        });
    });
});
