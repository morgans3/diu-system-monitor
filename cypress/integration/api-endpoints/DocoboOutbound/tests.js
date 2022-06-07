const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
const JWTs = {
    userJWT: "",
    docobokey: "",
};
let patientid = "";
const orgcode = "5505182964";

before(() => {
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("cypressaccounts").then((userDetails) => {
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

    cy.fixture("docobo").then((userDetails) => {
        userDetails.forEach((user) => {
            if (user["DOCOBO_INBOUNDKEY"]) JWTs.docobokey = user["DOCOBO_INBOUNDKEY"];
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
    it("Docobo Key is available to use", () => {
        cy.expect(JWTs.docobokey.length).to.be.at.least(1);
    });
});

describe("Test Endpoints and basic Security", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("DocoboOutbound");
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
});

describe("Test processDocoboInfo endpoint", () => {
    it("Check endpoint for 200 status", () => {
        const endpoint = endpoints.find((x) => x.endpoint.includes("processDocoboInfo"));
        cy.expect(endpoint).to.be.a("object");
        cy.apiRequest(endpoint, JWTs.docobokey).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});

describe("Test getpatientsbyorg endpoint", () => {
    it("Check endpoint for 400 status", () => {
        const endpoint = endpoints.find((x) => x.endpoint.includes("getpatientsbyorg"));
        cy.expect(endpoint).to.be.a("object");
        cy.apiRequest(endpoint, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("Check endpoint for 200 status", () => {
        const endpoint = endpoints.find((x) => x.endpoint.includes("getpatientsbyorg"));
        cy.expect(endpoint).to.be.a("object");
        cy.apiRequest(endpoint, JWTs.userJWT, { orgcode }).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            patientid = response.body.data[0].patientId;
        });
    });
});

describe("Test getpatientdata endpoint", () => {
    it("Check endpoint for 400 status", () => {
        const endpoint = endpoints.find((x) => x.endpoint.includes("getpatientdata"));
        cy.expect(endpoint).to.be.a("object");
        cy.apiRequest(endpoint, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("Check endpoint for 200 status", () => {
        const endpoint = endpoints.find((x) => x.endpoint.includes("getpatientdata"));
        cy.expect(endpoint).to.be.a("object");
        cy.apiRequest(endpoint, JWTs.userJWT, { patientid }).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});
