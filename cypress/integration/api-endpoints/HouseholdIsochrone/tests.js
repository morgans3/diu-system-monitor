const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
const JWTs = {
    userJWT: "",
    adminJWT: "",
};
let bounds =
    "[[-3.0576,53.802],[-3.0548,53.8023],[-3.0547,53.8019],[-3.0546,53.8019],[-3.0528,53.8013],[-3.0518,53.8007],[-3.0512,53.8004],[-3.0487,53.8001],[-3.0486,53.8001],[-3.0457,53.8006],[-3.0438,53.8019],[-3.0432,53.8034],[-3.043,53.8037],[-3.0434,53.805],[-3.0447,53.8055],[-3.0431,53.807],[-3.0457,53.8058],[-3.0469,53.8066],[-3.0482,53.8073],[-3.0474,53.808],[-3.0487,53.8076],[-3.0495,53.8073],[-3.0518,53.8065],[-3.0543,53.8055],[-3.0548,53.8047],[-3.0553,53.8037],[-3.0576,53.802]]";

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
            JWTs.userJWT = "JWT " + jwtToken;
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
            return x.tags.includes("HouseholdIsochrone");
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
    it("Check method exists", () => {
        searchEndpoint = endpoints.find((x) => {
            return x.endpoint.indexOf("houses-within-isochrone") !== -1;
        });
        cy.expect(searchEndpoint).to.be.a("object");
    });

    it("Test for get all pages (200)", () => {
        cy.apiRequest(searchEndpoint, JWTs.adminJWT, { isochrone_bounds: bounds }).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});
