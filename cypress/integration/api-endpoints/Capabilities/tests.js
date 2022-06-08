const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
const JWTs = {
    userJWT: "",
    adminJWT: "",
    username: "",
};
const fixture = {
    name: "testCapability",
    description: "a capability created for testing purposes",
    value: '{ "test": "value" }',
    authoriser: "cypressTestUser",
    tags: "{string1,string2}",
};
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
            return x.tags.includes("Capabilities");
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

describe("Test Create Method", () => {
    let createEndpoint;
    it("Check method exists", () => {
        createEndpoint = endpoints.find((x) => {
            return x.endpoint === "/capabilities/create";
        });
        cy.expect(createEndpoint).to.be.a("object");
    });

    it("Test for create capability (200)", () => {
        cy.apiRequest(createEndpoint, JWTs.adminJWT, fixture).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Test for create capability (401)", () => {
        cy.apiRequest(createEndpoint, "", fixture).then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });

    it("Test for create capability (403)", () => {
        cy.apiRequest(createEndpoint, JWTs.userJWT, fixture).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });
});

describe("Test Get All Method", () => {
    let getAllEndpoint;
    it("Check method exists", () => {
        getAllEndpoint = endpoints.find((x) => {
            return x.endpoint === "/capabilities";
        });
        cy.expect(getAllEndpoint).to.be.a("object");
    });

    it("Test for get all pages (200)", () => {
        cy.apiRequest(getAllEndpoint, JWTs.adminJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            if (response.body.length > 0) {
                response.body.forEach((capability) => {
                    if (capability.authoriser == "cypressTestUser") {
                        fixture.id = capability.id;
                    }
                });
            }
        });
    });

    it("Test for get all pages (401)", () => {
        cy.apiRequest(getAllEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });
});

describe("Test Update Method", () => {
    let updateEndpoint;
    it("Check method exists", () => {
        updateEndpoint = endpoints.find((x) => {
            return x.endpoint === "/capabilities/update";
        });
        cy.expect(updateEndpoint).to.be.a("object");
    });

    it("Test for update capabilities (200)", () => {
        console.log(fixture);
        cy.apiRequest(updateEndpoint, JWTs.adminJWT, fixture).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Test for update capabilities (401)", () => {
        cy.apiRequest(updateEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });

    it("Test for update capabilities (403)", () => {
        cy.apiRequest(updateEndpoint, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });
});

describe("Test get by ID Method", () => {
    let getByIDEndpoint;
    it("Check method exists", () => {
        getByIDEndpoint = endpoints.find((x) => {
            return x.endpoint === "/capabilities/{id}";
        });
        cy.expect(getByIDEndpoint).to.be.a("object");
    });

    it("Test for update capabilities (200)", () => {
        getByIDEndpoint.endpoint = getByIDEndpoint.endpoint.replace("{id}", fixture.id);
        cy.apiRequest(getByIDEndpoint, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Test for update capabilities (401)", () => {
        cy.apiRequest(getByIDEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });

    it("Test for update capabilities (404)", () => {
        getByIDEndpoint.endpoint = getByIDEndpoint.endpoint.replace(fixture.id, "0");
        cy.apiRequest(getByIDEndpoint, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(404);
        });
    });
});

describe("Test delete Method", () => {
    let deleteEndpoint;
    it("Check method exists", () => {
        deleteEndpoint = endpoints.find((x) => {
            return x.endpoint === "/capabilities/delete";
        });
        cy.expect(deleteEndpoint).to.be.a("object");
    });

    it("Test for get all pages (200)", () => {
        cy.apiRequest(deleteEndpoint, JWTs.adminJWT, { id: fixture.id }).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            if (response.body.length > 0) {
                response.body.forEach((capability) => {
                    if (capability.authoriser == "cypressTestUser") {
                        fixture.id = capability.id;
                    }
                });
            }
        });
    });

    it("Test for update capabilities (401)", () => {
        cy.apiRequest(deleteEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });

    it("Test for update capabilities (403)", () => {
        cy.apiRequest(deleteEndpoint, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });
});

describe("Test get by Tag Method", () => {
    let getByTagEndpoint;
    it("Check method exists", () => {
        getByTagEndpoint = endpoints.find((x) => {
            return x.endpoint === "/capabilities/tags/getByTag";
        });
        cy.expect(getByTagEndpoint).to.be.a("object");
        console.log(getByTagEndpoint);
    });

    it("Test for update capabilities (200)", () => {
        getByTagEndpoint.endpoint += "?tag=Patient";
        cy.apiRequest(getByTagEndpoint, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});
