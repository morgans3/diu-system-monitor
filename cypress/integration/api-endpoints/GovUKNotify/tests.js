const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
const JWTs = {
    govukkey: "",
};

before(() => {
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("secrets/govukkey").then((userDetails) => {
        userDetails.forEach((user) => {
            if (user["govukkey"]) JWTs.govukkey = user["govukkey"];
        });
    });
});

describe("Test Setup", () => {
    it("Is Swagger Data available?", () => {
        expect(swaggerResponse.length).to.be.at.least(1);
    });
    it("GovUK Key is available to use", () => {
        cy.expect(JWTs.govukkey.length).to.be.at.least(1);
    });
});

describe("Test Endpoints and basic Security", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("GovUKNotify");
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

describe("Test callback method", () => {
    let getEndpoint;
    it("Check method exists", () => {
        getEndpoint = endpoints.find((x) => {
            return x.endpoint.includes("/callback");
        });
        cy.expect(getEndpoint).to.be.a("object");
    });

    it("Test for Success (200)", () => {
        cy.apiRequest(getEndpoint, JWTs.govukkey, { params: "" }).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});

describe("Test maincallback method", () => {
    let getEndpoint;
    it("Check method exists", () => {
        getEndpoint = endpoints.find((x) => {
            return x.endpoint.includes("/maincallback");
        });
        cy.expect(getEndpoint).to.be.a("object");
    });

    it("Test for Success (200)", () => {
        cy.apiRequest(getEndpoint, JWTs.govukkey, { params: "" }).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});
