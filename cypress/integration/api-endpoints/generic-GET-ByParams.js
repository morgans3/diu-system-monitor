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

    cy.fixture("users").then((userDetails) => {
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

describe("Test Endpoints", () => {
    it("Check if endpoints to test", () => {
        cy.expect(controller.orderedEndpointData.length).to.be.at.least(1);
    });

    it("Check if endpoints are valid", () => {
        controller.orderedEndpointData.forEach((endpoint) => {
            cy.expect(endpoint.endpoint).to.be.a("string");
            cy.expect(endpoint.requestType).to.be.a("string");
        });
    });

    it("Check GET BY PARAMS endpoints - SUCCESS (200)", () => {
        const testingGETBYEndpointList = controller.orderedEndpointData.filter((x) => {
            return (
                x.requestType === "get" &&
                x.parameters &&
                !exclusions.isInExclusionList(x.tags[0]) &&
                !exclusions.isInGetByParamsExclusionList(x.tags[0]) &&
                x.endpoint.includes("{")
            );
        });
        console.log("Get by parameters endpoints...");

        // TODO: Add tests
        testingGETBYEndpointList.forEach((endpoint) => {
            const getAllEndpoint = controller.getAllTags[endpoint.tags[0]];
            if (endpoint.responses["403"]) {
                cy.apiRequest(endpoint, JWTs.userJWT).then((response) => {
                    cy.expect(response.status).to.be.equal(403);
                });
            } else if (endpoint.security) {
                cy.apiGetByParamsRequest(endpoint, JWTs.adminJWT, getAllEndpoint).then((response) => {
                    cy.expect(response.status).to.be.equal(200);
                });
            } else {
                cy.apiGetByParamsRequest(endpoint, "", getAllEndpoint).then((response) => {
                    cy.expect(response.status).to.be.equal(200);
                });
            }
        });
    });

    it("Check GET BY PARAMS endpoints - BAD Requests (404)", () => {
        const testingGETBYEndpointList = controller.orderedEndpointData.filter((x) => {
            return (
                x.requestType === "get" &&
                x.parameters &&
                !exclusions.isInExclusionList(x.tags[0]) &&
                !exclusions.isInGetByParamsExclusionList(x.tags[0]) &&
                x.endpoint.includes("{")
            );
        });
        console.log("Get by parameters endpoints...");
        // console.log(testingGETBYEndpointList);

        testingGETBYEndpointList.forEach((endpoint) => {
            testingGETBYEndpointList.forEach((endpoint) => {
                if (endpoint.responses["403"]) {
                    cy.apiRequest(endpoint, JWTs.userJWT).then((response) => {
                        cy.expect(response.status).to.be.equal(403);
                    });
                } else if (endpoint.security) {
                    cy.apiGetByParamsBadRequest(endpoint, JWTs.adminJWT).then((response) => {
                        cy.expect(response.status).to.be.equal(404);
                    });
                } else {
                    cy.apiGetByParamsBadRequest(endpoint, "").then((response) => {
                        cy.expect(response.status).to.be.equal(404);
                    });
                }
            });
        });
    });
});
