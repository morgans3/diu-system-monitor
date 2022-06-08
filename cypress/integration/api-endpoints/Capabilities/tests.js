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

const capabilityLinkFixture = {
    capability_id: 0,
    link_id: "cypressTestUser#Collaborative Partners",
    link_type: "user",
    valuejson: "allow",
};

const capabilityLinkSyncFixture = {
    capabilities: [
        {
            id: 0,
            valuejson: capabilityLinkFixture.valuejson,
        },
    ],
    link_id: capabilityLinkFixture.link_id,
    link_type: capabilityLinkFixture.link_type,
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

    it("Test for get all (200)", () => {
        cy.apiRequest(getAllEndpoint, JWTs.adminJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            if (response.body.length > 0) {
                response.body.forEach((capability) => {
                    if (capability.authoriser == "cypressTestUser") {
                        fixture.id = capability.id;
                        capabilityLinkFixture.capability_id = capability.id;
                        capabilityLinkSyncFixture.capabilities[0].id = capability.id;
                    }
                });
            }
        });
    });

    it("Test for get all (401)", () => {
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

    it("Test for get by ID capabilities (200)", () => {
        getByIDEndpoint.endpoint = getByIDEndpoint.endpoint.replace("{id}", fixture.id);
        cy.apiRequest(getByIDEndpoint, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Test for get by ID capabilities (401)", () => {
        cy.apiRequest(getByIDEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });

    it("Test for get by ID capabilities (404)", () => {
        getByIDEndpoint.endpoint = getByIDEndpoint.endpoint.replace(fixture.id, "0");
        cy.apiRequest(getByIDEndpoint, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(404);
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
    });

    it("Test for get by Tag (200)", () => {
        getByTagEndpoint.endpoint += "?tags=Patient";
        cy.apiRequest(getByTagEndpoint, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Test for get by Tag (401)", () => {
        cy.apiRequest(getByTagEndpoint, "").then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });
});

describe("Test get by Multiple Tags (and) Method", () => {
    let getByTagsAndEndpoint;
    it("Check method exists", () => {
        getByTagsAndEndpoint = endpoints.find((x) => {
            return x.endpoint === "/capabilities/tags/getByTagsAnd";
        });
        cy.expect(getByTagsAndEndpoint).to.be.a("object");
    });

    it("Test for get by Tag (200)", () => {
        getByTagsAndEndpoint.endpoint += "?tags[]=Patient,Health";
        cy.apiRequest(getByTagsAndEndpoint, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Test for get by Tag (401)", () => {
        cy.apiRequest(getByTagsAndEndpoint, "").then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });
});

describe("Test get by Multiple Tags (or) Method", () => {
    let getByTagsOrEndpoint;
    it("Check method exists", () => {
        getByTagsOrEndpoint = endpoints.find((x) => {
            return x.endpoint === "/capabilities/tags/getByTagsOr";
        });
        cy.expect(getByTagsOrEndpoint).to.be.a("object");
    });

    it("Test for get by Tag (200)", () => {
        getByTagsOrEndpoint.endpoint += "?tags[]=Patient,App";
        cy.apiRequest(getByTagsOrEndpoint, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Test for get by Tag (401)", () => {
        cy.apiRequest(getByTagsOrEndpoint, "").then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });
});

describe("Test get by capabilities link create", () => {
    let linkCreateEndpoint;
    it("Check method exists", () => {
        linkCreateEndpoint = endpoints.find((x) => {
            return x.endpoint === "/capabilities/links/create";
        });
        cy.expect(linkCreateEndpoint).to.be.a("object");
    });

    it("Test for creating capability links (200)", () => {
        cy.apiRequest(linkCreateEndpoint, JWTs.adminJWT, capabilityLinkFixture).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Test for creating capability links (401)", () => {
        cy.apiRequest(linkCreateEndpoint, "", capabilityLinkFixture).then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });

    it("Test for creating capability links (403)", () => {
        cy.apiRequest(linkCreateEndpoint, JWTs.userJWT, capabilityLinkFixture).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });
});

describe("Test get by ID & Type Method", () => {
    let getByTypeIDEndpoint;
    it("Check method exists", () => {
        getByTypeIDEndpoint = endpoints.find((x) => {
            return x.endpoint === "/{type}/{id}/capabilities";
        });
        cy.expect(getByTypeIDEndpoint).to.be.a("object");
    });

    it("Test for get by ID & Type capabilities (200)", () => {
        getByTypeIDEndpoint.endpoint = getByTypeIDEndpoint.endpoint.replace("{id}", capabilityLinkFixture.link_id);
        getByTypeIDEndpoint.endpoint = getByTypeIDEndpoint.endpoint.replace("{type}", capabilityLinkFixture.link_type);
        getByTypeIDEndpoint.endpoint = getByTypeIDEndpoint.endpoint.replace("#", "%23");
        cy.apiRequest(getByTypeIDEndpoint, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Test for get by ID & Type capabilities (204)", () => {
        getByTypeIDEndpoint.endpoint = getByTypeIDEndpoint.endpoint.replace("%23", "#");
        getByTypeIDEndpoint.endpoint = getByTypeIDEndpoint.endpoint.replace(capabilityLinkFixture.link_id, "dojoidfhiudbfisdb");
        cy.apiRequest(getByTypeIDEndpoint, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(204);
        });
    });

    it("Test for get by ID & Type capabilities (401)", () => {
        cy.apiRequest(getByTypeIDEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });
});

describe("Test get by capabilities link sync", () => {
    let linkSyncEndpoint;
    it("Check method exists", () => {
        linkSyncEndpoint = endpoints.find((x) => {
            return x.endpoint === "/capabilities/links/sync";
        });
        cy.expect(linkSyncEndpoint).to.be.a("object");
    });

    it("Test for syncing capability links (200)", () => {
        cy.apiRequest(linkSyncEndpoint, JWTs.adminJWT, capabilityLinkSyncFixture).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Test for syncing capability links (401)", () => {
        cy.apiRequest(linkSyncEndpoint, "", capabilityLinkSyncFixture).then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });

    it("Test for syncing capability links (403)", () => {
        cy.apiRequest(linkSyncEndpoint, JWTs.userJWT, capabilityLinkSyncFixture).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });
});

describe("Test get by capabilities link delete", () => {
    let linkDeleteEndpoint;
    it("Check method exists", () => {
        linkDeleteEndpoint = endpoints.find((x) => {
            return x.endpoint === "/capabilities/links/delete";
        });
        cy.expect(linkDeleteEndpoint).to.be.a("object");
    });

    it("Test for deleting capability links (200)", () => {
        cy.apiRequest(linkDeleteEndpoint, JWTs.adminJWT, capabilityLinkFixture).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Test for deleting capability links (401)", () => {
        cy.apiRequest(linkDeleteEndpoint, "", capabilityLinkFixture).then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });

    it("Test for deleting capability links (403)", () => {
        cy.apiRequest(linkDeleteEndpoint, JWTs.userJWT, capabilityLinkFixture).then((response) => {
            cy.expect(response.status).to.be.equal(403);
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

    it("Test for delete capabilities (401)", () => {
        cy.apiRequest(deleteEndpoint, "", {}).then((response) => {
            cy.expect(response.status).to.be.equal(401);
        });
    });

    it("Test for delete capabilities (403)", () => {
        cy.apiRequest(deleteEndpoint, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });
});
