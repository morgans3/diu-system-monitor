/// <reference types="cypress" />

import { _settings } from "../../../settings";

const getAllEndpoint = "/userprofiles/getAll";
const registerEndpoint = "/userprofiles/register";
const selectUserEndpoint = "/userprofiles/getUserProfileByUsername*";
const removeUserEndpoint = "/userprofiles/archive*";
const getAllContainerID = "#operations-UserProfiles-get_userprofiles_getAll";
const registerContainerID =
  "#operations-UserProfiles-post_userprofiles_register";
const getByUsercontainerID =
  "#operations-UserProfiles-get_userprofiles_getUserProfileByUsername_username__username_";
const removeUserContainerID =
  "#operations-UserProfiles-put_userprofiles_archive_profile_id__profile_id_";
const keys = ["_id", "username"];

describe("Test UserProfile API calls", () => {
  beforeEach(() => {
    cy.visit(_settings.baseURL + "/api-docs");
  });

  it("attempt to get all user profiles", () => {
    cy.getAll(getAllEndpoint, getAllContainerID, keys);
  });

  // let userProfileID = "";
  // it("attempt to create a user profile", () => {
  //   cy.fixture("userProfile").then((userProfile) => {
  //     cy.testRegistration(
  //       registerEndpoint,
  //       registerContainerID,
  //       userProfile
  //     ).then((data) => {
  //       userProfileID = data.body._id;
  //     });
  //   });
  // });

  // it("attempt to select a user profile", () => {
  //   cy.fixture("userProfile").then((userProfile) => {
  //     cy.testSelectUser(
  //       selectUserEndpoint,
  //       getByUsercontainerID,
  //       userProfile
  //     ).then((testSelectUser) => {
  //       console.log(testSelectUser);
  //       cy.log(testSelectUser);
  //     });
  //   });
  // });

  //update fixture

  // it("attempt to update a user profile", () => {
  //   cy.fixture("userProfile").then((userProfile) => {
  //     let tryButtonSelector =
  //       removeUserContainerID + " button.btn.try-out__btn";
  //     let executeButtonSelector =
  //       removeUserContainerID + " button.btn.execute.opblock-control__btn";
  //     cy.getJWT().then((jwtToken) => {
  //       cy.log(jwtToken);
  //       cy.swaggerAuth(jwtToken, _settings.baseURL + "/api-docs");
  //       cy.intercept(removeUserEndpoint).as("removeProfile");
  //       cy.get(removeUserContainerID).click();
  //       cy.get(tryButtonSelector).click();
  //       let selector =
  //         removeUserContainerID + " input[placeholder='profile_id']";
  //       cy.get(selector).type(userProfile._id);
  //       cy.get(executeButtonSelector)
  //         .click()
  //         .wait("@removeProfile")
  //         .then((interceptedData) => {
  //           cy.log(interceptedData.response.body);
  //           expect(interceptedData.response.statusCode).to.eq(200);
  //           return interceptedData.response;
  //         });
  //     });
  //   });
  // });

  // it("attempt to remove a user profile", () => {
  //   cy.fixture("userProfile").then((userProfile) => {
  //     let tryButtonSelector =
  //       removeUserContainerID + " button.btn.try-out__btn";
  //     let executeButtonSelector =
  //       removeUserContainerID + " button.btn.execute.opblock-control__btn";
  //     cy.getJWT().then((jwtToken) => {
  //       cy.log(jwtToken);
  //       cy.swaggerAuth(jwtToken, _settings.baseURL + "/api-docs");
  //       cy.intercept(removeUserEndpoint).as("removeProfile");
  //       cy.get(removeUserContainerID).click();
  //       cy.get(tryButtonSelector).click();
  //       let selector =
  //         removeUserContainerID + " input[placeholder='profile_id']";
  //       cy.get(selector).type(userProfile._id);
  //       cy.get(executeButtonSelector)
  //         .click()
  //         .wait("@removeProfile")
  //         .then((interceptedData) => {
  //           cy.log(interceptedData.response.body);
  //           expect(interceptedData.response.statusCode).to.eq(200);
  //           return interceptedData.response;
  //         });
  //     });
  //   });
  // });
});
