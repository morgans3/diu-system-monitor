const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let endpoints;
let swaggerResponse;
const JWTs = {
    userJWT: "",
    adminJWT: "",
    username: "",
};
let shellTeam;
let member;

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

            cy.makeShellTeam(JWTs.username, JWTs.userJWT).then((response) => {
                shellTeam = response.body.data;
            });
        });
    });
});

after(() => {
    cy.deleteShellTeam(shellTeam, JWTs.userJWT);
});

describe("Test Setup", () => {
    it("Is Swagger Data available?", () => {
        expect(swaggerResponse.length).to.be.at.least(1);
    });
    it("User Token is available to use", () => {
        cy.expect(JWTs.userJWT.length).to.be.at.least(1);
    });
    it("Admin Token is available to use", () => {
        cy.expect(JWTs.adminJWT.length).to.be.at.least(1);
    });
});

describe("Test Endpoints and basic Security", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("TeamMembers");
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

describe("Test POST Method", () => {
    let postEndpoint;
    it("Check method exists", () => {
        postEndpoint = endpoints.find((x) => {
            return x.requestType === "post";
        });
        cy.expect(postEndpoint).to.be.a("object");
    });

    it("Test for Bad Request (400)", () => {
        cy.apiRequest(postEndpoint, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("Test for Forbidden save (403)", () => {
        const params = {
            teamcode: shellTeam.code,
            username: JWTs.username,
            joindate: "2020-01-01T00:00:00.000Z",
        };
        cy.apiRequest(postEndpoint, JWTs.adminJWT, params).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });

    it("Test for Successful save (200)", () => {
        const params = {
            teamcode: shellTeam.code,
            username: JWTs.username,
            joindate: "2020-01-01T00:00:00.000Z",
        };
        cy.apiRequest(postEndpoint, JWTs.userJWT, params).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.log(response.body);
            cy.expect(response.body.data).to.be.a("object");
            member = response.body.data;
        });

        cy.wait(500); // write/read delayed for DynamoDB
    });
});

describe("Test GET Methods", () => {
    let getEndpoint;
    it("Check method exists", () => {
        getEndpoint = endpoints.find((x) => {
            return x.requestType === "get";
        });
        cy.expect(getEndpoint).to.be.a("object");
    });

    it("Check get all", () => {
        cy.apiRequest(getEndpoint, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check get by params - ID", () => {
        getEndpoint.endpoint = "/teammembers/" + member["_id"];
        cy.apiRequest(getEndpoint, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check get by params - Username", () => {
        const newendpoint = "/teammembers/username/" + JWTs.username;
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check get by params - Teamcode", () => {
        const newendpoint = "/teammembers/teamcode/" + shellTeam.code;
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});

describe("Test PUT Method", () => {
    let putEndpoint;
    it("Check method exists", () => {
        putEndpoint = endpoints.find((x) => {
            return x.requestType === "put";
        });
        cy.expect(putEndpoint).to.be.a("object");
    });

    it("Test for Bad request update (400)", () => {
        cy.apiRequest(putEndpoint, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("Test for Unsuccessful update (403)", () => {
        member.id = member["_id"];
        member.enddate = "2022-01-01T00:00:00.000Z";
        cy.apiRequest(putEndpoint, JWTs.adminJWT, member).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });

    it("Test for Successful update (200)", () => {
        member.id = member["_id"];
        member.enddate = "2022-01-01T00:00:00.000Z";
        cy.apiRequest(putEndpoint, JWTs.userJWT, member).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.log(response.body);
            cy.expect(response.body.data).to.be.a("object");
        });
    });
});

describe("Test DELETE Method", () => {
    let deleteEndpoint;
    it("Check method exists", () => {
        deleteEndpoint = endpoints.find((x) => {
            return x.requestType === "delete";
        });
        cy.expect(deleteEndpoint).to.be.a("object");
    });

    it("Test for Bad request delete (400)", () => {
        cy.apiRequest(deleteEndpoint, JWTs.userJWT, {}).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("Test for Successful delete (200)", () => {
        cy.wait(500); // write/read delayed for DynamoDB
        cy.apiRequest(deleteEndpoint, JWTs.userJWT, { id: member["_id"], teamcode: shellTeam.code }).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.log(response.body);
        });
    });

    it("Test for not found delete (404)", () => {
        cy.apiRequest(deleteEndpoint, JWTs.userJWT, { id: member["_id"], teamcode: shellTeam.code }).then((response) => {
            cy.expect(response.status).to.be.equal(404);
        });
    });
});
