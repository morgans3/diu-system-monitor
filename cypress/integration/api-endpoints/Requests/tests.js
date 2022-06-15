const decodeToken = require("../../../helpers/token").decodeToken;
const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
let accountRequest;
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

    cy.generateVerificationCode().then((code) => {
        cy.log(code);
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
            return x.tags.includes("Requests");
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

describe("Test obtain the requests", () => {
    it("Obtain Requests - SUCCESS 200", () => {
        const newendpoint = `/requests/`;
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Obtain Requests - Forbidden 403", () => {
        const newendpoint = `/requests/`;
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });
});

describe("Test requesting an account", () => {
    it("Obtain request account - SUCCESS 200", () => {
        const newendpoint = "/requests/account/";
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        cy.getVerificationCode().then((verificationCode) => {
            const bodyParams = {
                firstname: "Test",
                surname: "User",
                professional_role: "Tester",
                professional_number: "123456789",
                organisation: "Collaborative Partners",
                request_sponsor: "nexus.intelligencenw@nhs.net",
                email: JWTs.user.email,
                pid_access: {},
                email_verification_code: verificationCode,
            };
            cy.apiRequest(type, null, bodyParams).then((response) => {
                cy.expect(response.status).to.be.equal(200);
                cy.log(response.body.data);
                accountRequest = response.body.data;
            });
        });
    });

    it("Obtain request account - Bad Request 400", () => {
        const newendpoint = "/requests/account/";
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, null, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("Check request account - SUCCESS 200", () => {
        const newendpoint = "/requests/account/" + accountRequest.id;
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, null, {}).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Complete request account - SUCCESS 200", () => {
        const newendpoint = "/requests/account/complete/";
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        const bodyParams = {
            parent_id: accountRequest.id,
            action: "deny",
            date: new Date().toISOString(),
        };
        cy.apiRequest(type, null, bodyParams).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Complete request account - Bad Request 400", () => {
        const newendpoint = "/requests/account/complete/";
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, null, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });
});

describe("Test requesting help", () => {
    it("Obtain request account - SUCCESS 200", () => {
        const newendpoint = "/requests/help/";
        const bodyParams = {
            email: JWTs.user.email,
            message: "This is a test message from the diu-system-monitor",
            attributes: {},
        };
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, null, bodyParams).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
    it("Obtain request account - Bad Request 400", () => {
        const newendpoint = "/requests/help/";
        const type = {
            requestType: "post",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, null, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });
});
