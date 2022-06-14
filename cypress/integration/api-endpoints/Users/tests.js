const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
const JWTs = {
    userJWT: "",
    adminJWT: "",
    username: "",
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
        JWTs.username = userDetails.username;
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

describe("Test Endpoints and basic Security", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("Users");
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

describe("Test GET Methods", () => {
    it("Check get all", () => {
        const newendpoint = "/users/";
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check profile method", () => {
        const newendpoint = "/users/profile";
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check validate method", () => {
        const newendpoint = "/users/validate";
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check authentication refresh method", () => {
        const newendpoint = "/users/authentication-refresh";
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});

describe("Test GET BY id method", () => {
    let getByParamEndpoint;
    it("Check for 400 Bad request", () => {
        getByParamEndpoint = "/users/" + JWTs.username;
        const type = {
            requestType: "get",
            endpoint: getByParamEndpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("Check for successful request 200", () => {
        getByParamEndpoint += "%23Collaborative Partners";
        const type = {
            requestType: "get",
            endpoint: getByParamEndpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check for entry not found 404", () => {
        const type = {
            requestType: "get",
            endpoint: getByParamEndpoint.replace(JWTs.username, "notausername"),
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(404);
        });
    });
});

describe("Test adding and removing a user account", () => {
    let registerEndpoint;
    let deleteEndpoint;
    let testingNewUser;
    it("Check for 400 Bad request - CREATE", () => {
        registerEndpoint = "/users/register";
        const type = {
            requestType: "post",
            endpoint: registerEndpoint,
        };
        cy.apiRequest(type, JWTs.adminJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("Check for 403 Forbidden request - CREATE", () => {
        testingNewUser = {
            name: "Another Test User",
            username: "testuser",
            email: "testing@example.com",
            password: "testpassword",
            organisation: "Collaborative Partners",
            linemanager: JWTs.username,
        };
        const type = {
            requestType: "post",
            endpoint: registerEndpoint,
        };
        cy.apiRequest(type, JWTs.userJWT, testingNewUser).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });

    it("Check for successful request 200 - CREATE", () => {
        const type = {
            requestType: "post",
            endpoint: registerEndpoint,
        };
        cy.apiRequest(type, JWTs.adminJWT, testingNewUser).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check for 400 Bad request - DELETE", () => {
        deleteEndpoint = "/users/delete";
        const type = {
            requestType: "delete",
            endpoint: deleteEndpoint,
        };
        cy.apiRequest(type, JWTs.adminJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("Check for 403 Forbidden request - DELETE", () => {
        const type = {
            requestType: "delete",
            endpoint: deleteEndpoint,
        };
        cy.apiRequest(type, JWTs.userJWT, testingNewUser).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });

    it("Check for successful request 200 - DELETE", () => {
        const type = {
            requestType: "delete",
            endpoint: deleteEndpoint,
        };
        cy.apiRequest(type, JWTs.adminJWT, testingNewUser).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check for user not found 404 - DELETE", () => {
        const type = {
            requestType: "delete",
            endpoint: deleteEndpoint,
        };
        cy.apiRequest(type, JWTs.adminJWT, testingNewUser).then((response) => {
            cy.expect(response.status).to.be.equal(404);
        });
    });
});

// TODO: Test send-code and verify-code (requires email access)
