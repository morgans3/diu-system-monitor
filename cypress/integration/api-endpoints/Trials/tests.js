const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
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

    cy.fixture("users").then((userDetails) => {
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

describe("Test Endpoints and basic Security", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("Trials");
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

describe("Test GET Endpoint", () => {
    it("Check endpoint for 200 status", () => {
        const endpoint = endpoints.find((x) => {
            return x.requestType === "get";
        });
        cy.apiRequest(endpoint, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});

describe("Test POST Endpoint", () => {
    let postendpoint;
    it("Check endpoint for 400 status", () => {
        postendpoint = endpoints.find((x) => {
            return x.requestType === "post";
        });
        const params = {};
        cy.apiRequest(postendpoint, JWTs.userJWT, params).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("Check endpoint for 200 status", () => {
        const params = {
            search: `{"LTCs2Dimension":[["Diabetes"]],"GPDimension":["P81136"]}`,
            phases: "4,not_applicable",
            min_date: "40",
        };
        cy.apiRequest(postendpoint, JWTs.userJWT, params).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});
