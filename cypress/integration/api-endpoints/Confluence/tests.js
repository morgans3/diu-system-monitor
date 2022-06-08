const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
let searchID;

before(() => {
    // Act
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("cypressaccounts").then((userDetails) => {
        const adminUserData = {
            username: userDetails.admin_username,
            password: userDetails.admin_password,
            organisation: "Collaborative Partners",
            authentication: "Demo",
        };
        cy.getJWT(adminUserData).then((jwtToken) => {
            JWTs.adminJWT = "JWT " + jwtToken;
        });
        JWTs.username = userDetails.username;
        const userData = {
            username: userDetails.username,
            password: userDetails.password,
            organisation: "Collaborative Partners",
            authentication: "Demo",
        };
        cy.getJWT(userData).then((jwtToken) => {
            "" = "JWT " + jwtToken;
        });
    });
});

describe("Test Setup", () => {
    it("Is Swagger Data available?", () => {
        expect(swaggerResponse.length).to.be.at.least(1);
    });
});

describe("Test Endpoints and basic Security", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("Confluence");
        });
        cy.expect(endpoints.length).to.be.at.least(1);
    });

    it("Check if endpoints are valid", () => {
        endpoints.forEach((endpoint) => {
            cy.expect(endpoint.endpoint).to.be.a("string");
            cy.expect(endpoint.requestType).to.be.a("string");
        });
    });
});

describe("Test Search Method", () => {
    let searchEndpoint;
    let fullSearchCount;
    it("Check method exists", () => {
        searchEndpoint = endpoints.find((x) => {
            return x.endpoint.indexOf("search") !== -1;
        });
        cy.expect(searchEndpoint).to.be.a("object");
    });

    it("Test for get all pages (200)", () => {
        cy.apiRequest(searchEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            fullSearchCount = response.body.results.length;
            response.body.results.forEach((result) => {
                searchID = result.id;
            });
        });
    });

    it("Test for get limited pages (200)", () => {
        console.log(searchEndpoint);
        searchEndpoint.endpoint += "?keyword=password";
        cy.apiRequest(searchEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.expect(fullSearchCount).to.be.gt(response.body.results.length);
        });
    });
});

describe("Test Get By ID Method", () => {
    let idEndpoint;
    it("Check method exists", () => {
        idEndpoint = endpoints.find((x) => {
            return x.endpoint.indexOf("{id}") !== -1;
        });
        cy.expect(idEndpoint).to.be.a("object");
    });

    it("Test for get by ID (200)", () => {
        idEndpoint.endpoint = idEndpoint.endpoint.replace("{id}", searchID);
        cy.apiRequest(idEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            console.log(response);
        });
    });

    it("Test for get by ID (404)", () => {
        idEndpoint.endpoint = idEndpoint.endpoint.replace(searchID, "12345");
        cy.apiRequest(idEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.expect(response.body.statusCode).to.be.equal(404);
        });
    });

    it("Test for get by ID (500)", () => {
        idEndpoint.endpoint = idEndpoint.endpoint.replace("12345", "test");
        cy.apiRequest(idEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(500);
        });
    });
});
