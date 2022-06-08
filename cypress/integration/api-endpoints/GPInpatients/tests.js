const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let swaggerResponse;
let endpoints;
const JWTs = {
    fyldecoastJWT: "",
    bthBearerToken: "",
};

before(() => {
    // Act
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("secrets/adcredentials").then((userDetails) => {
        let ldapauth;
        let ldappass;
        userDetails.forEach((user) => {
            if (user["ldapauth"]) ldapauth = user["ldapauth"];
            if (user["ldappass"]) ldappass = user["ldappass"];
        });
        const fyldecoastUserData = {
            username: ldapauth.replace("@xfyldecoast.nhs.uk", ""),
            password: ldappass,
            organisation: "Fylde Coast",
            authentication: "xfyldecoast",
        };
        cy.getJWT(fyldecoastUserData).then((jwtToken) => {
            JWTs.fyldecoastJWT = "JWT " + jwtToken;
        });
    });
});

describe("Test Setup", () => {
    it("Is Swagger Data available?", () => {
        expect(swaggerResponse.length).to.be.at.least(1);
    });
    it("Fylde Coast Token is available to use", () => {
        cy.expect(JWTs.fyldecoastJWT.length).to.be.at.least(1);
    });
});

describe("Test Endpoints", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("GPInpatients");
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
            cy.apiRequest(endpoint, null).then((response) => {
                cy.expect(response.status).to.be.equal(401);
            });
        });
    });

    it("Check authenticate endpoint", () => {
        const endpoint = endpoints.find((x) => x.endpoint.includes("authenticate"));
        console.log(endpoint);
        cy.expect(endpoint).to.be.a("object");
        cy.apiRequest(endpoint, JWTs.fyldecoastJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.expect(response.body.success).to.be.equal(true);
            JWTs.bthBearerToken = response.body.msg.token;
        });
    });

    it("Retrieve BTH Stats - 200 success", () => {
        cy.expect(JWTs.bthBearerToken.length).to.be.at.least(1);
        const statEndpoints = endpoints.filter((x) => !x.endpoint.includes("authenticate"));
        statEndpoints.forEach((endpoint) => {
            cy.apiRequest(endpoint, JWTs.fyldecoastJWT, { token: JWTs.bthBearerToken }).then((response) => {
                cy.expect(response.status).to.be.equal(200);
            });
        });
    });

    it("Retrieve BTH Stats - 400 Bad Requests", () => {
        cy.expect(JWTs.bthBearerToken.length).to.be.at.least(1);
        const statEndpoints = endpoints.filter((x) => !x.endpoint.includes("authenticate"));
        statEndpoints.forEach((endpoint) => {
            cy.apiRequest(endpoint, JWTs.fyldecoastJWT, {}).then((response) => {
                cy.expect(response.status).to.be.equal(400);
            });
        });
    });
});
