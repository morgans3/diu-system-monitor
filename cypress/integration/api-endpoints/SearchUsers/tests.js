const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let swaggerResponse;
let endpoints;
const JWTs = {
    userJWT: "",
    username: "",
};

before(() => {
    // Act
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("secrets/cypressaccounts").then((userDetails) => {
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
});

describe("Test Endpoints", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("SearchUsers");
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
            cy.apiRequest(endpoint, JWTs.userJWT).then((response) => {
                cy.expect(response.status).to.be.equal(400);
            });
        });
    });
});

describe("Test profiles success (200)", () => {
    let thisendpoint;

    it("profiles is available", () => {
        thisendpoint = controller.orderedEndpointData.find((x) => {
            return x.endpoint.includes("/profiles");
        });
        cy.expect(thisendpoint).to.be.a("object");
    });

    it("profiles returns 200 status", () => {
        const simEndpoint = {
            endpoint: thisendpoint.endpoint + "?searchterm=" + JWTs.username,
            requestType: thisendpoint.requestType,
        };
        cy.apiRequest(simEndpoint, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});

describe("Test org-profiles success (200)", () => {
    let thisendpoint;

    it("profiles is available", () => {
        thisendpoint = controller.orderedEndpointData.find((x) => {
            return x.endpoint.includes("/org-profiles");
        });
        cy.expect(thisendpoint).to.be.a("object");
    });

    it("profiles returns 200 status", () => {
        const simEndpoint = {
            endpoint: thisendpoint.endpoint + "?searchterm=" + JWTs.username + "&organisation=Demo",
            requestType: thisendpoint.requestType,
        };
        cy.apiRequest(simEndpoint, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});
