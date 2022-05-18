/// <reference types="cypress" />

describe("AtomicPayloads - '/atomic/payloads/delete'", () => {
    const tag = "AtomicPayloads";
    const testingEndpoint = "/atomic/payloads/delete";
    let objSwaggerData = {};
    let userDetails = {};
    const bodyParams = {
        id: "voluptas",
        type: "est",
    };
    const bodyParamsFail = {
        id: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
        type: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
        config: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
    };
    const bodyParamsBadPayload = {
        type: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
        config: "g#paA%pzsVNDi6c4cPy$R3Vn!N4Jq6",
    };
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
        });
        cy.getJWT(userDetails.userData).then((jwtToken) => {
            userJWT = "JWT " + jwtToken;
        });
    });

    it("get endpoint information from swagggerjson", () => {
        cy.getSwaggerData(tag, testingEndpoint).then((swaggerData) => {
            objSwaggerData = swaggerData;
        });
    });

    it("test against each status", () => {
        Object.keys(objSwaggerData.responses).forEach((responseStatus) => {
            let JWT = "";
            switch (responseStatus) {
                case "200":
                    if (objSwaggerData.security.length > 0) {
                        JWT = adminJWT;
                    }
                    cy.apiRequest(objSwaggerData, JWT, bodyParams).then((testResponse) => {
                        cy.expect(testResponse.status).to.oneOf([200, 304]);
                    });
                    break;
                case "401":
                    cy.apiRequest(objSwaggerData, JWT, bodyParams).then((testResponse) => {
                        cy.expect(testResponse.status).to.oneOf([401]);
                    });
                    break;
                case "403":
                    if (objSwaggerData.security.length > 0) {
                        JWT = userJWT;
                    }
                    cy.apiRequest(objSwaggerData, JWT, bodyParams).then((testResponse) => {
                        cy.expect(testResponse.status).to.oneOf([403, 400]);
                    });
                    break;
                case "400":
                    if (objSwaggerData.security.length > 0) {
                        JWT = adminJWT;
                    }
                    cy.apiRequest(objSwaggerData, JWT, bodyParamsBadPayload).then((testResponse) => {
                        cy.expect(testResponse.status).to.oneOf([400]);
                    });
                    break;
                case "404":
                    if (objSwaggerData.security.length > 0) {
                        JWT = adminJWT;
                    }
                    cy.apiRequest(objSwaggerData, JWT, bodyParamsFail).then((testResponse) => {
                        cy.expect(testResponse.status).to.oneOf([404]);
                    });
                    break;
            }
        });
    });
});
