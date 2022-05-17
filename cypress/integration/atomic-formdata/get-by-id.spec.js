/// <reference types="cypress" />

import { _settings } from "../../../settings";

describe("Atomic Formdata - '/atomic/formdata/{id}'", () => {
  const tag = "Atomic Formdata";
  const testingEndpoint = "/atomic/formdata/{id}";
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

  it("test against each status", () => {
    Object.keys(objSwaggerData.responses).forEach((responseStatus) => {
      let JWT = "";
      switch (responseStatus) {
        case "200":
          if (objSwaggerData.security.length > 0) {
            JWT = userJWT;
          }
          cy.getAll(objSwaggerData, JWT).then((testResponse) => {
            console.log(testResponse);
            cy.expect(testResponse.status).to.oneOf([200, 304]);
          });
          break;
        case "401":
          cy.getAll(objSwaggerData, JWT).then((testResponse) => {
            console.log(testResponse);
            cy.expect(testResponse.status).to.oneOf([401]);
          });
          break;
      }
    });
  });
});
