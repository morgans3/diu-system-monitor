/// <reference types="cypress" />

import { _settings } from "../../../settings";

let endPointsContainer = "#operations-Endpoints-get_endpoints_getAll";
let getAllEndpoint = "/endpoints/getAll";

describe("Test UserProfile API calls", () => {
  beforeEach(() => {
    cy.visit(_settings.baseURL + "/api-docs");
  });

  it("attempt to get all endpoints", () => {
    cy.request(_settings.baseURL + "/swagggerjson").then((response) => {
      console.log(response);
      cy.log(response);
    });
    // cy.getJWT().then((jwtToken) => {
    //   cy.swaggerAuth(jwtToken, _settings.baseURL + "/api-docs");
    //   cy.getAll(getAllEndpoint, endPointsContainer).then((endpointData) => {
    //     cy.expect(endpointData.response.statusCode).to.oneOf([200, 304]);
    //     let arrEndpoints = endpointData.response.body.data;
    //     let objEndpoints = {};
    //     if (arrEndpoints && arrEndpoints.length) {
    //       arrEndpoints.forEach((endpoint) => {
    //         let endpointUrlData = String(endpoint.url).split("/");
    //         console.log(endpointUrlData);
    //         cy.log(endpointUrlData);
    //         if (objEndpoints[endpointUrlData[1]]) {
    //           objEndpoints[endpointUrlData[1]].push(endpointUrlData[2]);
    //         } else {
    //           objEndpoints[endpointUrlData[1]] = [endpointUrlData[2]];
    //         }
    //       });
    //     }
    //     let objFixtures = {};
    //     Object.keys(objEndpoints).forEach((dataType) => {
    //       let endpointData = objEndpoints[dataType];
    //       endpointData.forEach((endpoint) => {
    //         if (endpoint == undefined || endpoint.toLowerCase() == "getall") {
    //           objFixtures[dataType] = dataType;
    //           let fixtureEndpoint = "/" + dataType;
    //           if (endpoint) {
    //             fixtureEndpoint += "/" + endpoint;
    //           }
    //           let selector = `[data-path="${fixtureEndpoint}"]`;
    //           cy.get(selector)
    //             .parents(".opblock")
    //             .then((urlContainer) => {
    //               cy.log(urlContainer);
    //             });
    //         }
    //       });
    //     });
    //   });
    // });
  });
});
