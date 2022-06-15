const decodeToken = require("../../../helpers/token").decodeToken;
const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
let createdLog;
const JWTs = {
    userJWT: "",
    adminJWT: "",
    user: {},
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
            JWTs.user = decodeToken(jwtToken);
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

describe("Test Endpoints and basic Security", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("AccessLogs");
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

describe("Test Create Log", () => {
    it("Create Log - SUCCESS 200", () => {
        const newendpoint = "/access-logs/create";
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT, { type: "Test", data: {} }).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            createdLog = response.body.data;
            cy.log(createdLog);
        });
    });

    it("Create Log - Bad Request 400", () => {
        const newendpoint = "/access-logs/create";
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });
});

describe("Test finding the created Log", () => {
    it("Obtain Log - SUCCESS 200", () => {
        const newendpoint = `/${JWTs.user.username}/access-logs/`;
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Obtain Log - Forbidden 403", () => {
        const newendpoint = `/${JWTs.user.username}/access-logs/`;
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });

    it("Obtain Logs - SUCCESS 200", () => {
        const newendpoint = `/access-logs/`;
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Obtain Logs - Forbidden 403", () => {
        const newendpoint = `/access-logs/`;
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });
});

describe("Test obtaining the statistics", () => {
    it("Obtain Statistics - SUCCESS 200", () => {
        const newendpoint = "/access-logs/statistics/?date_from=2020-01-01&date_to=2020-01-02";
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
    it("Obtain Statistics - Bad Request 400", () => {
        const newendpoint = "/access-logs/statistics/";
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });
    it("Obtain Statistics - Forbidden 403", () => {
        const newendpoint = "/access-logs/statistics/?date_from=2020-01-01&date_to=2020-01-02";
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });
});
