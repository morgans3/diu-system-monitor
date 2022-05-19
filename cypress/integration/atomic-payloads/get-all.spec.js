/// <reference types="cypress" />

describe("AtomicPayloads - '/atomic/payloads/'", () => {
    const tag = "AtomicPayloads";
    const testingEndpoint = "/atomic/payloads";
    let objSwaggerData = {};
    let userDetails = {};
    const replaceData = {
        passReplaceData: {},
        failReplaceData: {},
    };
    const bodyParams = {
        bodyParams: {},
        bodyParamsFail: {},
    };
    const JWTs = {
        userJWT: "",
        adminJWT: "",
    };

    it("Get admin/ user credentials from AWS", () => {
        cy.getAccounts().then((accountData) => {
            userDetails = accountData;
        });
    });

    it("get admin/ user JWT logging into system with AWS data", () => {
        cy.getJWT(userDetails.adminUserData).then((jwtToken) => {
            JWTs.adminJWT = "JWT " + jwtToken;
        });
        cy.getJWT(userDetails.userData).then((jwtToken) => {
            JWTs.userJWT = "JWT " + jwtToken;
        });
    });

    it("get endpoint information from swagggerjson", () => {
        cy.getSwaggerDataOld(tag, testingEndpoint).then((swaggerData) => {
            objSwaggerData = swaggerData;
        });
    });

    it("test against each status", () => {
        cy.testEndpointResponses(objSwaggerData, JWTs, bodyParams, replaceData);
    });
});
