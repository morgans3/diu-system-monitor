/// <reference types="cypress" />

describe("AtomicPayloads - '/atomic/payloads/{id}'", () => {
    const tag = "AtomicPayloads";
    const testingEndpoint = "/atomic/payloads/{id}";
    // TODO: hardcoded payload id
    const passReplaceData = {
        "{id}": "Suicide_Prevention",
    };
    const failReplaceData = {
        "{id}": "vTMdCxvsDvo!%a6kTFzY4TGCxepzm%",
    };
    let objSwaggerData = {};
    let userDetails = {};
    let userJWT = "";
    let adminJWT = "";

    it("Get admin/ user credentials from AWS", () => {
        cy.getAccounts().then((accountData) => {
            userDetails = accountData;
        });
    });

    it("get admin/ user JWT logging into system with AWS data", () => {
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
                        JWT = userJWT;
                    }
                    cy.apiRequest(objSwaggerData, JWT, null, passReplaceData).then((testResponse) => {
                        cy.expect(testResponse.status).to.oneOf([200, 304]);
                    });
                    break;
                case "401":
                    cy.apiRequest(objSwaggerData, JWT, null, passReplaceData).then((testResponse) => {
                        cy.expect(testResponse.status).to.oneOf([401]);
                    });
                    break;
                case "404":
                    cy.apiRequest(objSwaggerData, JWT, null, failReplaceData).then((testResponse) => {
                        cy.expect(testResponse.status).to.oneOf([404, 400]);
                    });
                    break;
            }
        });
    });
});
