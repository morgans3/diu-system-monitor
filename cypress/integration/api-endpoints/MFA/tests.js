const totp = require("totp-generator");
const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let swaggerResponse;
let endpoints;
let checkEndpoint;
let registerEndpoint;
let verifyEndpoint;
let validateEndpoint;
const JWTs = {
    userJWT: "",
    username: "",
};
let MFAToken = {
    tempSecret: "",
    dataURL: "",
    tfaURL: "",
};
let unregisterEndpoint;

before(() => {
    // Act
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
            JWTs.username = userDetails.username;
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

describe("Test Endpoints", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("MFA") && !x.endpoint.includes("/otp/");
        });
        console.log(endpoints);
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
            cy.apiRequest(endpoint, null).then((response) => {
                cy.expect(response.status).to.be.equal(401);
            });
        });
    });
});

describe("Test checkmfa endpoint", () => {
    it("Check endpoint to test", () => {
        checkEndpoint = endpoints.filter((x) => {
            return x.endpoint.includes("/checkmfa");
        })[0];
        cy.expect(checkEndpoint.endpoint.length).to.be.at.least(1);
    });

    it("Check endpoint for 200 status", () => {
        cy.apiRequest(checkEndpoint, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.expect(response.body.msg).to.be.equal(false);
        });
    });
});

describe("Test register endpoint", () => {
    it("Check endpoint to test", () => {
        registerEndpoint = endpoints.filter((x) => {
            return x.endpoint.includes("/register");
        })[0];
        cy.expect(registerEndpoint.endpoint.length).to.be.at.least(1);
    });

    it("Check endpoint for 200 status", () => {
        cy.apiRequest(registerEndpoint, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            MFAToken = response.body;
        });
    });
});

describe("Test verify endpoint", () => {
    it("Check endpoint to test", () => {
        verifyEndpoint = endpoints.filter((x) => {
            return x.endpoint.includes("/verify");
        })[0];
        cy.expect(verifyEndpoint.endpoint.length).to.be.at.least(1);
    });

    it("Check endpoint for 200 status", () => {
        const token = totp(MFAToken.tempSecret);
        console.log(token);
        const bodyParams = {
            token,
            tempSecret: MFAToken.tempSecret,
        };
        console.log(bodyParams);
        cy.apiRequest(verifyEndpoint, JWTs.userJWT, bodyParams).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.expect(response.body.status).to.be.equal(200);
        });
    });
});

describe("Test validate endpoint", () => {
    it("Check endpoint to test", () => {
        validateEndpoint = endpoints.filter((x) => {
            return x.endpoint.includes("/validate");
        })[0];
        cy.expect(validateEndpoint.endpoint.length).to.be.at.least(1);
    });

    it("Check endpoint for 200 status", () => {
        const token = totp(MFAToken.tempSecret);
        console.log(token);
        const bodyParams = {
            token,
        };
        cy.apiRequest(validateEndpoint, JWTs.userJWT, bodyParams).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});

describe("Test unregister endpoint", () => {
    it("Check endpoint to test", () => {
        unregisterEndpoint = endpoints.filter((x) => {
            return x.endpoint.includes("/unregister");
        })[0];
        cy.expect(unregisterEndpoint.endpoint.length).to.be.at.least(1);
    });

    it("Check endpoint for 200 status", () => {
        cy.apiRequest(unregisterEndpoint, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});
