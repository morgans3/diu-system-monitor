const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let swaggerResponse;
let endpoints;
const JWTs = {
    userJWT: "",
};

before(() => {
    // Act
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("cypressaccounts").then((userDetails) => {
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
});

describe("Test Endpoint basics", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("NICEEvidenceSearch");
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

    it("Check endpoint for 400 status", () => {
        endpoints.forEach((endpoint) => {
            if (endpoint.requestType === "post") {
                cy.apiRequest(endpoint, JWTs.userJWT, {}).then((response) => {
                    cy.expect(response.status).to.be.equal(400);
                });
            }
        });
    });
});

describe("Test evidencesearch", () => {
    let thisendpoint;
    it("Check for evidencesearch endpoint", () => {
        thisendpoint = endpoints[0];
        cy.expect(thisendpoint).to.be.a("object");
    });

    it("Check endpoint for 200 status", () => {
        cy.apiRequest(thisendpoint, JWTs.userJWT, { search_query: "diabetes", search_length: "1" }).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});
