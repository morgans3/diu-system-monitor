import { settings } from "../../../../settings";
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

before(() => {
    cy.getSwaggerData().then((swaggerData) => {
        swaggerResponse = swaggerData;
        controller = new ApiBaseClass(swaggerData);
    });

    cy.fixture("secrets/cypressaccounts").then((userDetails) => {
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
            return x.tags.includes("Teams");
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

describe("Create a team for testing", () => {
    it("Create a team", () => {
        const requestConfig = {
            method: "post",
            url: settings.apiURL + "/teams/create",
            headers: {
                Authorization: JWTs.userJWT,
            },
            body: {
                code: "RandomTestTeam",
                name: "RandomTestTeam",
                description: "Shell Team to Test Codebase",
                organisationcode: "Admin",
                responsiblepeople: [JWTs.username],
            },
        };
        cy.request(requestConfig).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            shellTeam = response.body.data;
            cy.wait(500); // write/read delayed for DynamoDB
        });
    });
});

describe("Test GET Methods", () => {
    it("Check get all", () => {
        const newendpoint = "/teams/";
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check get by params - Team Code", () => {
        const newendpoint = "/teams/getTeamByCode?code=" + shellTeam.code;
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check get by params - OrgCode", () => {
        const newendpoint = "/teams/getTeamsByOrgCode?orgcode=" + shellTeam.organisationcode;
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check get by params - Partial Team Name", () => {
        const newendpoint = "/teams/getTeamsByPartialTeamName?partialteam=" + shellTeam.name;
        const type = {
            requestType: "get",
            endpoint: newendpoint,
        };
        cy.apiRequest(type, JWTs.userJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });

    it("Check get by params - Partial Team Name & Org Code", () => {
        const newendpoint = "/teams/getTeamsByPartialTeamName?partialteam=" + shellTeam.name + "&orgcode=" + shellTeam.organisationcode;
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

    it("Test for Successful update (200)", () => {
        shellTeam.organisationcode = "Test";
        cy.apiRequest(putEndpoint, JWTs.userJWT, shellTeam).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.wait(500); // write/read delayed for DynamoDB
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

    it("Test for Unsuccessful update (403)", () => {
        cy.apiRequest(deleteEndpoint, JWTs.adminJWT, shellTeam).then((response) => {
            cy.expect(response.status).to.be.equal(403);
        });
    });

    it("Test for Successful delete (200)", () => {
        cy.wait(500); // write/read delayed for DynamoDB
        cy.apiRequest(deleteEndpoint, JWTs.userJWT, { id: shellTeam.id, code: shellTeam.code }).then((response) => {
            cy.expect(response.status).to.be.equal(200);
        });
    });
});
