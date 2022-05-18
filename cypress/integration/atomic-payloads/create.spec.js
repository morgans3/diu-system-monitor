/// <reference types="cypress" />
describe("AtomicPayloads - '/atomic/payloads/create'", () => {
    const tag = "AtomicPayloads";
    const testingEndpoint = "/atomic/payloads/create";
    let objSwaggerData = {};
    let userDetails = {};
    let bodyParams = {};
    let bodyParamsFail = {};
    let userJWT = "";
    let adminJWT = "";

    it("Get admin/ user credentials from AWS", () => {
        cy.getAccounts().then((accountData) => {
            userDetails = accountData;
        });
    });

    it("get admin/ user JWT logging into system with AWS data", () => {
        cy.getJWT(userDetails.adminUserData).then((jwtToken) => {
            adminJWT = "JWT " + jwtToken;
            console.log(adminJWT);
        });
        cy.getJWT(userDetails.userData).then((jwtToken) => {
            userJWT = "JWT " + jwtToken;
            console.log(userJWT);
        });
    });

    it("get endpoint information from swagggerjson", () => {
        cy.getSwaggerData(tag, testingEndpoint).then((swaggerData) => {
            objSwaggerData = swaggerData;
        });
    });

    it("prepare fixture data", () => {
        cy.createFixture(objSwaggerData).then((data) => {
            bodyParams = data;
        });
    });

    it("prepare fail fixture data", () => {
        cy.createFailFixture(objSwaggerData).then((data) => {
            bodyParamsFail = data;
        });
    });

    it("test against each status", () => {
        Object.keys(objSwaggerData.responses).forEach((responseStatus) => {
            let JWT = "";
            //TODO: figure out hall monitor requests
            switch (responseStatus) {
                case "200":
                    if (objSwaggerData.security.length > 0) {
                        JWT = adminJWT;
                    }
                    cy.create(objSwaggerData, JWT, bodyParams).then((testResponse) => {
                        console.log(testResponse);
                        cy.expect(testResponse.status).to.oneOf([200, 304]);
                    });
                    break;
                case "401":
                    cy.create(objSwaggerData, JWT, bodyParams).then((testResponse) => {
                        console.log(testResponse);
                        cy.expect(testResponse.status).to.oneOf([401]);
                    });
                    break;
                case "403":
                    if (objSwaggerData.security.length > 0) {
                        JWT = userJWT;
                    }
                    cy.create(objSwaggerData, JWT, bodyParams).then((testResponse) => {
                        console.log(testResponse);
                        cy.expect(testResponse.status).to.oneOf([403, 400]);
                    });
                    break;
                case "400":
                    if (objSwaggerData.security.length > 0) {
                        JWT = adminJWT;
                    }
                    cy.create(objSwaggerData, JWT, bodyParamsFail).then((testResponse) => {
                        console.log(testResponse);
                        cy.expect(testResponse.status).to.oneOf([400, 500]);
                    });
                    break;
            }
        });
    });
});
