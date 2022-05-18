/// <reference types="cypress" />

describe("AtomicPayloads - '/atomic/payloads/update'", () => {
    const tag = "AtomicPayloads";
    const testingEndpoint = "/atomic/payloads/update";
    let objSwaggerData = {};
    let userDetails = {};
    const replaceData = {
        passReplaceData: {},
        failReplaceData: {},
    };
    const bodyParams = {
        bodyParams: {
            id: "max",
            type: "ullam",
            config: "etet",
        },
        bodyParamsFail: {
            id: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
            type: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
            config: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
        },
        bodyParamsBadPayload: {
            type: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
            config: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
        },
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
        cy.getSwaggerData(tag, testingEndpoint).then((swaggerData) => {
            objSwaggerData = swaggerData;
        });
    });

    it("test against each status", () => {
        cy.getRandomString().then((randomString) => {
            bodyParams.bodyParams.config = randomString;
        });
        cy.testEndpointResponses(objSwaggerData, JWTs, bodyParams, replaceData);
    });
});
