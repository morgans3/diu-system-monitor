const ApiBaseClass = require("../../../classes/api-base-class");
let controller;
let swaggerResponse;
let endpoints;
const JWTs = {
    userJWT: "",
    adminJWT: "",
};
let patient;
const testPatientNHSNumber = "0123456789";

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

describe("Test Endpoints", () => {
    it("Check if endpoints to test", () => {
        endpoints = controller.orderedEndpointData.filter((x) => {
            return x.tags.includes("Demographics");
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

    it("Check endpoint for 403 status", () => {
        endpoints.forEach((endpoint) => {
            if (endpoint.responses["403"]) {
                cy.apiRequest(endpoint, JWTs.userJWT).then((response) => {
                    cy.expect(response.status).to.be.equal(403);
                });
            }
        });
    });
});

describe("Test demographicsbynhsnumber", () => {
    let thisendpoint;

    it("demographicsbynhsnumber is available", () => {
        thisendpoint = controller.orderedEndpointData.find((x) => {
            return x.endpoint.includes("demographicsbynhsnumber");
        });
        cy.expect(thisendpoint).to.be.a("object");
    });

    it("demographicsbynhsnumber returns 404 status", () => {
        const simEndpoint = {
            endpoint: thisendpoint.endpoint + "?NHSNumber=01234",
            requestType: thisendpoint.requestType,
        };
        cy.apiRequest(simEndpoint, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(404);
        });
    });

    it("demographicsbynhsnumber returns 400 status", () => {
        const simEndpoint = {
            endpoint: thisendpoint.endpoint,
            requestType: thisendpoint.requestType,
        };
        cy.apiRequest(simEndpoint, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("demographicsbynhsnumber returns 200 status", () => {
        const simEndpoint = {
            endpoint: thisendpoint.endpoint + "?NHSNumber=" + testPatientNHSNumber,
            requestType: thisendpoint.requestType,
        };
        cy.apiRequest(simEndpoint, JWTs.adminJWT).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            patient = response.body;
            patient["NHSNumber"] = testPatientNHSNumber;
            cy.log(patient);
        });
    });
});

describe("Test validateNHSNumber", () => {
    let thisendpoint;

    it("validateNHSNumber is available", () => {
        thisendpoint = controller.orderedEndpointData.find((x) => {
            return x.endpoint.includes("validateNHSNumber");
        });
        cy.expect(thisendpoint).to.be.a("object");
    });

    it("validateNHSNumber returns 200 status - Patient not found", () => {
        const simEndpoint = {
            endpoint: thisendpoint.endpoint,
            requestType: thisendpoint.requestType,
        };
        const body = {
            NHSNumber: "9876543210",
            DateOfBirth: patient.dob,
        };
        cy.apiRequest(simEndpoint, JWTs.adminJWT, body).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.expect(response.body.success).to.be.equal(false);
        });
    });

    it("validateNHSNumber returns 400 status", () => {
        const simEndpoint = {
            endpoint: thisendpoint.endpoint,
            requestType: thisendpoint.requestType,
        };
        cy.apiRequest(simEndpoint, JWTs.adminJWT, patient).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("validateNHSNumber returns 200 status - Patient found", () => {
        const simEndpoint = {
            endpoint: thisendpoint.endpoint,
            requestType: thisendpoint.requestType,
        };
        const body = {
            NHSNumber: patient.NHSNumber,
            DateOfBirth: patient.DOB,
        };
        cy.apiRequest(simEndpoint, JWTs.adminJWT, body).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.expect(response.body.success).to.be.equal(true);
        });
    });
});

describe("Test findMyNHSNumber", () => {
    let thisendpoint;

    it("findMyNHSNumber is available", () => {
        thisendpoint = controller.orderedEndpointData.find((x) => {
            return x.endpoint.includes("findMyNHSNumber");
        });
        cy.expect(thisendpoint).to.be.a("object");
    });

    it("findMyNHSNumber returns 200 status - Patient not found", () => {
        const simEndpoint = {
            endpoint: thisendpoint.endpoint,
            requestType: thisendpoint.requestType,
        };
        const body = {
            gender: "U",
            dob: patient.DOB,
            postcode: "NOT APC",
        };
        cy.apiRequest(simEndpoint, JWTs.adminJWT, body).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.expect(response.body.success).to.be.equal(true);
            cy.expect(response.body.nhsnumber).to.be.equal(null);
        });
    });

    it("findMyNHSNumber returns 400 status", () => {
        const simEndpoint = {
            endpoint: thisendpoint.endpoint,
            requestType: thisendpoint.requestType,
        };
        cy.apiRequest(simEndpoint, JWTs.adminJWT, patient).then((response) => {
            cy.expect(response.status).to.be.equal(400);
        });
    });

    it("findMyNHSNumber returns 200 status - Patient found", () => {
        const simEndpoint = {
            endpoint: thisendpoint.endpoint,
            requestType: thisendpoint.requestType,
        };
        const body = {
            gender: patient.Gender,
            dob: patient.DOB,
            postcode: patient.PostCode,
        };
        cy.apiRequest(simEndpoint, JWTs.adminJWT, body).then((response) => {
            cy.expect(response.status).to.be.equal(200);
            cy.expect(response.body.success).to.be.equal(true);
            cy.expect(response.body.nhsnumber).to.be.equal(testPatientNHSNumber);
        });
    });
});
