const ApiBaseClass = require("../../classes/api-base-class");
const exclusions = require("./_genericexclusions").Exclusions;
const modifiers = require("../../helpers/parameters").Modifiers;
let controller;
let endpoints;
let swaggerResponse;
const JWTs = {
    userJWT: "",
    adminJWT: "",
};

before(() => {
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

describe("Test Endpoints", () => {
    it("Check if endpoints to test", () => {
        // Set list of testing endpoints to those with create/update/delete, not in exclusion list
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.requestType === "delete" && !exclusions.isInExclusionList(x.tags[0]);
        });
        cy.expect(endpoints.length).to.be.at.least(1);
    });

    it("Check if endpoints are valid", () => {
        endpoints.forEach((endpoint) => {
            cy.expect(endpoint.endpoint).to.be.a("string");
            cy.expect(endpoint.requestType).to.be.a("string");
        });
    });

    it("Check POST endpoints - BAD Requests (400)", () => {
        endpoints.forEach((endpoint) => {
            const postEndpoint = {
                requestType: "post",
                endpoint: endpoint.endpoint.replace("/delete", "/create"),
            };
            if (endpoint.security) {
                cy.apiRequest(postEndpoint, JWTs.adminJWT, {}).then((response) => {
                    cy.expect(response.status).to.be.equal(400);
                });
            } else {
                cy.apiRequest(postEndpoint, "", {}).then((response) => {
                    cy.expect(response.status).to.be.equal(400);
                });
            }
        });
    });

    it("Check POST endpoints - SUCCESS (200)", () => {
        endpoints.forEach((endpoint) => {
            const postEndpoint = {
                requestType: "post",
                endpoint: endpoint.endpoint.replace("/delete", "/create"),
            };
            endpoint.bodyParams = modifiers.newBodyParameters(endpoint, controller.orderedEndpointData);
            if (endpoint.security) {
                cy.apiRequest(postEndpoint, JWTs.adminJWT, endpoint.bodyParams).then((response) => {
                    cy.expect(response.status).to.be.equal(200);
                    cy.expect(response.body.data).to.be.a("object");
                    endpoint.bodyParams = response.body.data;
                });
            } else {
                cy.apiRequest(postEndpoint, "", endpoint.bodyParams).then((response) => {
                    cy.expect(response.status).to.be.equal(200);
                });
            }
        });
    });

    it("Check PUT endpoints - SUCCESS (200)", () => {
        endpoints.forEach((endpoint) => {
            const putEndpoint = {
                requestType: "put",
                endpoint: endpoint.endpoint.replace("/delete", "/update"),
            };
            if (endpoint.security) {
                cy.apiRequest(putEndpoint, JWTs.adminJWT, endpoint.bodyParams).then((response) => {
                    cy.expect(response.status).to.be.equal(200);
                });
            } else {
                cy.apiRequest(putEndpoint, "", endpoint.bodyParams).then((response) => {
                    cy.expect(response.status).to.be.equal(200);
                });
            }
        });
    });

    it("Check PUT endpoints - BAD Requests (400)", () => {
        endpoints.forEach((endpoint) => {
            const putEndpoint = {
                requestType: "put",
                endpoint: endpoint.endpoint.replace("/delete", "/update"),
            };
            if (endpoint.security) {
                cy.apiRequest(putEndpoint, JWTs.adminJWT, {}).then((response) => {
                    cy.expect(response.status).to.be.equal(400);
                });
            } else {
                cy.apiRequest(putEndpoint, "", {}).then((response) => {
                    cy.expect(response.status).to.be.equal(400);
                });
            }
        });
    });

    it("Check DELETE endpoints - Bad Request (400)", () => {
        endpoints.forEach((endpoint) => {
            if (endpoint.security) {
                cy.apiRequest(endpoint, JWTs.adminJWT, {}).then((response) => {
                    cy.expect(response.status).to.be.equal(400);
                });
            } else {
                cy.apiRequest(endpoint, "", {}).then((response) => {
                    cy.expect(response.status).to.be.equal(400);
                });
            }
        });
    });

    it("Check DELETE endpoints - SUCCESS (200)", () => {
        endpoints.forEach((endpoint) => {
            if (endpoint.security) {
                cy.apiRequest(endpoint, JWTs.adminJWT, endpoint.bodyParams).then((response) => {
                    cy.expect(response.status).to.be.equal(200);
                });
            } else {
                cy.apiRequest(endpoint, "", endpoint.bodyParams).then((response) => {
                    cy.expect(response.status).to.be.equal(200);
                });
            }
        });
    });

    it("Check DELETE endpoints - BAD Requests (404)", () => {
        endpoints.forEach((endpoint) => {
            if (endpoint.security) {
                cy.apiRequest(endpoint, JWTs.adminJWT, endpoint.bodyParams).then((response) => {
                    cy.expect(response.status).to.be.equal(404);
                });
            } else {
                cy.apiRequest(endpoint, "", endpoint.bodyParams).then((response) => {
                    cy.expect(response.status).to.be.equal(404);
                });
            }
        });
    });

    it("Check PUT endpoints - Not Found (404)", () => {
        endpoints.forEach((endpoint) => {
            const putEndpoint = {
                requestType: "put",
                endpoint: endpoint.endpoint.replace("/delete", "/update"),
            };
            const fullEndpoint = controller.orderedEndpointData.find((point) => point.endpoint === putEndpoint.endpoint);
            if (fullEndpoint.responses["404"]) {
                if (endpoint.security) {
                    cy.apiRequest(putEndpoint, JWTs.adminJWT, endpoint.bodyParams).then((response) => {
                        cy.expect(response.status).to.be.equal(404);
                    });
                } else {
                    cy.apiRequest(putEndpoint, "", endpoint.bodyParams).then((response) => {
                        cy.expect(response.status).to.be.equal(404);
                    });
                }
            }
        });
    });
});
