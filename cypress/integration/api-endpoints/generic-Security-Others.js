const ApiBaseClass = require("../../classes/api-base-class");
const exclusions = require("./_genericexclusions").Exclusions;
let controller;
let swaggerResponse;
const JWTs = {
    userJWT: "",
    adminJWT: "",
};

before(() => {
    // Act
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("secrets/cypressaccounts").then((userDetails) => {
        const adminUserData = {
            username: userDetails.admin_username,
            password: userDetails.admin_password,
            organisation: "Collaborative Partners",
            authentication: "Demo",
        };
        cy.getJWT(adminUserData).then((jwtToken) => {
            JWTs.adminJWT = "JWT " + jwtToken;
        });
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
    it("Admin Token is available to use", () => {
        cy.expect(JWTs.adminJWT.length).to.be.at.least(1);
    });
});

describe("Test Security - POST, PUT, DELETE", () => {
    it("Check if endpoints to test", () => {
        cy.expect(controller.orderedEndpointData.length).to.be.at.least(1);
    });

    it("Check if endpoints are valid", () => {
        controller.orderedEndpointData.forEach((endpoint) => {
            cy.expect(endpoint.endpoint).to.be.a("string");
            cy.expect(endpoint.requestType).to.be.a("string");
        });
    });

    it("Check POST endpoints", () => {
        const testingPOSTEndpointList = controller.orderedEndpointData.filter((x) => {
            return x.requestType === "post" && !exclusions.isInPOSTExclusionList(x.tags[0]);
        });
        console.log("Post endpoints...");
        console.log(testingPOSTEndpointList);

        testingPOSTEndpointList.forEach((endpoint) => {
            if (endpoint.responses["403"]) {
                cy.apiRequest(endpoint, JWTs.userJWT).then((response) => {
                    cy.expect(response.status).to.be.equal(403);
                });
                cy.apiRequest(endpoint, "FakeJWT").then((response) => {
                    cy.expect(response.status).to.be.equal(401);
                });
            } else if (endpoint.security) {
                cy.apiRequest(endpoint, "FakeJWT").then((response) => {
                    cy.expect(response.status).to.be.equal(401);
                });
            }
        });
    });

    it("Check PUT endpoints", () => {
        const testingPUTEndpointList = controller.orderedEndpointData.filter((x) => {
            return x.requestType === "put" && !exclusions.isInPutExclusionList(x.tags[0]);
        });
        console.log("Put endpoints...");
        console.log(testingPUTEndpointList);

        testingPUTEndpointList.forEach((endpoint) => {
            if (endpoint.responses["403"]) {
                cy.apiRequest(endpoint, JWTs.userJWT).then((response) => {
                    cy.expect(response.status).to.be.equal(403);
                });
                cy.apiRequest(endpoint, "FakeJWT").then((response) => {
                    cy.expect(response.status).to.be.equal(401);
                });
            } else if (endpoint.security) {
                cy.apiRequest(endpoint, "FakeJWT").then((response) => {
                    cy.expect(response.status).to.be.equal(401);
                });
            }
        });
    });

    it("Check DELETE endpoints", () => {
        const testingDELETEEndpointList = controller.orderedEndpointData.filter((x) => {
            return x.requestType === "delete" && !exclusions.isInDeletionExclusionList(x.tags[0]);
        });
        console.log("Delete endpoints...");
        console.log(testingDELETEEndpointList);

        testingDELETEEndpointList.forEach((endpoint) => {
            if (endpoint.responses["403"]) {
                cy.apiRequest(endpoint, JWTs.userJWT).then((response) => {
                    cy.expect(response.status).to.be.equal(403);
                });
                cy.apiRequest(endpoint, "FakeJWT").then((response) => {
                    cy.expect(response.status).to.be.equal(401);
                });
            } else if (endpoint.security) {
                cy.apiRequest(endpoint, "FakeJWT").then((response) => {
                    cy.expect(response.status).to.be.equal(401);
                });
            }
        });
    });
});
