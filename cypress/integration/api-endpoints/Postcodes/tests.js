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

describe("Test Endpoint", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("PostCodes");
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

    it(
        "Check endpoint for 200 status",
        {
            defaultCommandTimeout: 1000 * 60 * 1, // 1 minute
        },
        () => {
            endpoints.forEach((endpoint) => {
                if (endpoint.endpoint !== "/postcodes/") {
                    // The exclusion is due to Chrome struggling with the FeatureCollection. Works in App and PGAdmin.
                    // see https://github.com/morgans3/NHS_Business_Intelligence_Platform_Api/issues/63 for notes
                    cy.apiRequest(endpoint, JWTs.userJWT).then((response) => {
                        cy.expect(response.status).to.be.equal(200);
                    });
                }
            });
        }
    );
});
