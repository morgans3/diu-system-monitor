const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let swaggerResponse;
let serviceaccounts;
let serviceAccountEndpoint;

before(() => {
    // Act
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("serviceaccounts").then((accounts) => {
        serviceaccounts = accounts;
    });
});

describe("Test Setup", () => {
    it("Is Swagger Data available?", () => {
        expect(swaggerResponse.length).to.be.at.least(1);
    });

    it("Is ServiceAccounts available to use", () => {
        expect(serviceaccounts.length).to.be.at.least(1);
    });
});

describe("Test Endpoint", () => {
    it("Check if endpoints to test", () => {
        serviceAccountEndpoint = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("ServiceAccounts");
        });
        cy.expect(serviceAccountEndpoint.length).to.be.at.least(1);
    });

    it("Check if endpoints are valid", () => {
        serviceAccountEndpoint.forEach((endpoint) => {
            cy.expect(endpoint.endpoint).to.be.a("string");
            cy.expect(endpoint.requestType).to.be.a("string");
        });
    });

    it("Check endpoint for 400 status", () => {
        console.log(serviceAccountEndpoint[0]);

        cy.apiRequest(serviceAccountEndpoint[0], null, { org: null, key: null }).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("Check endpoint for 404 status", () => {
        console.log(serviceAccountEndpoint[0]);

        cy.apiRequest(serviceAccountEndpoint[0], null, { org: "NOTANORG", key: "NOTAKEY" }).then((response) => {
            cy.expect(response.status).to.be.equal(404);
        });
    });

    it("Check endpoint for 200 status", () => {
        console.log(serviceAccountEndpoint[0]);

        serviceaccounts.forEach((serviceaccount) => {
            cy.apiRequest(serviceAccountEndpoint[0], null, serviceaccount).then((response) => {
                cy.expect(response.status).to.be.equal(200);
            });
        });
    });
});
