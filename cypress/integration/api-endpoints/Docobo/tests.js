const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
const JWTs = {
    docobokey: "",
};

before(() => {
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("secrets/docobo").then((userDetails) => {
        userDetails.forEach((user) => {
            if (user["DOCOBO_INBOUNDKEY"]) JWTs.docobokey = user["DOCOBO_INBOUNDKEY"];
        });
    });
});

describe("Test Setup", () => {
    it("Is Swagger Data available?", () => {
        expect(swaggerResponse.length).to.be.at.least(1);
    });
    it("Docobo Key is available to use", () => {
        cy.expect(JWTs.docobokey.length).to.be.at.least(1);
    });
});

describe("Test Endpoints and basic Security", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("Docobo");
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

describe("Test acknowledgements method", () => {
    let getEndpoint;
    it("Check method exists", () => {
        getEndpoint = endpoints.find((x) => {
            return x.requestType === "get";
        });
        cy.expect(getEndpoint).to.be.a("object");
    });

    it("Test for Success (200)", () => {
        cy.apiRequest(getEndpoint, JWTs.docobokey).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});

describe("Test report method", () => {
    let postEndpoint;
    it("Check method exists", () => {
        postEndpoint = endpoints.find((x) => {
            return x.requestType === "post";
        });
        cy.expect(postEndpoint).to.be.a("object");
    });

    it("Test for Success (200)", () => {
        const body = {
            importFileName: "string",
            totalPatientsInFile: 0,
            error: "string",
            result: [
                {
                    rowNumber: 0,
                    nhsNumber: "string",
                    isEnrolled: true,
                    error: "string",
                },
            ],
        };
        cy.apiRequest(postEndpoint, JWTs.docobokey, body).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});
