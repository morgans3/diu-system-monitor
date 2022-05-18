/// <reference types="cypress" />

import { fail } from "assert";
import { _settings } from "../../../settings";

describe("AtomicPayloads - '/atomic/payloads/{id}'", () => {
  const tag = "AtomicPayloads";
  const testingEndpoint = "/atomic/payloads/{id}";
  //TODO: hardcoded payload id
  const workingID = "Suicide_Prevention";
  const failID = "vTMdCxvsDvo!%a6kTFzY4TGCxepzm%";
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
          cy.getByID(objSwaggerData, JWT, workingID).then((testResponse) => {
            console.log(testResponse);
            cy.expect(testResponse.status).to.oneOf([200, 304]);
          });
          break;
        case "401":
          cy.getByID(objSwaggerData, JWT, workingID).then((testResponse) => {
            console.log(testResponse);
            cy.expect(testResponse.status).to.oneOf([401]);
          });
          break;
        case "404":
          cy.getByID(objSwaggerData, JWT, failID).then((testResponse) => {
            console.log(testResponse);
            cy.expect(testResponse.status).to.oneOf([404, 400]);
          });
          break;
      }
    });
  });
});
