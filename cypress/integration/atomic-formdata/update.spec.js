/// <reference types="cypress" />

describe("Atomic Formdata - '/atomic/formdata/update'", () => {
    const tag = "Atomic Formdata";
    const testingEndpoint = "/atomic/formdata/update";
    let objSwaggerData = {};
    let userDetails = {};
    const replaceData = {
        passReplaceData: {},
        failReplaceData: {},
    };
    const bodyParams = {
        bodyParams: {
            id: "1234",
            formid: "testing",
            config: "string",
        },
        bodyParamsFail: {
            id: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
            formid: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
            config: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
        },
        bodyParamsBadPayload: {
            formid: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
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
