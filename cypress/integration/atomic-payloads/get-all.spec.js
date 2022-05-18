/// <reference types="cypress" />

import { _settings } from "../../../settings";

describe("AtomicPayloads - '/atomic/payloads/'", () => {
  const tag = "AtomicPayloads";
  const testingEndpoint = "/atomic/payloads";
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
      console.log(objSwaggerData.responses[responseStatus]);
      switch (responseStatus) {
        case "200":
          cy.getAll(objSwaggerData, userJWT).then((testResponse) => {
            console.log(testResponse);
            cy.expect(testResponse.status).to.oneOf([200, 304]);
          });
          break;
      }
    });
  });
});
