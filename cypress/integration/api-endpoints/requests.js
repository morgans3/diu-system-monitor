/// <reference types="cypress" />

import { _settings } from "../../../settings";

describe("Test UserProfile API calls", () => {
  let objAllEndpoints = {};
  let JWT = "";
  let objCreatedData = {};

  it("attempt to get JWT", () => {
    cy.getJWT().then((jwtToken) => {
      JWT = "JWT " + jwtToken;
      console.log(JWT);
    });
  });

  it("attempt to get all endpoints", () => {
    cy.request(_settings.baseURL + "/swagggerjson").then((swagggerResponse) => {
      cy.expect(swagggerResponse.status).to.oneOf([200, 304]);
      if (swagggerResponse.body && swagggerResponse.body.paths) {
        let swagggerResponseData = swagggerResponse.body.paths;
        Object.keys(swagggerResponseData).forEach((endpoint) => {
          Object.keys(swagggerResponseData[endpoint]).forEach((requestType) => {
            let objEndpointData = swagggerResponseData[endpoint][requestType];
            objEndpointData["endpoint"] = endpoint;
            objEndpointData["requestType"] = requestType;
            if (objAllEndpoints[objEndpointData.tags[0]]) {
              objAllEndpoints[objEndpointData.tags[0]].push(objEndpointData);
            } else {
              objAllEndpoints[objEndpointData.tags[0]] = [objEndpointData];
            }
          });
        });
      }
    });
  });

  it('attempt to test all "get all" endpoints data', () => {
    Object.keys(objAllEndpoints).forEach((apiTag) => {
      let arrEndpoints = objAllEndpoints[apiTag];
      console.log("New endpoints");
      console.log(apiTag);
      arrEndpoints.forEach((endpointData) => {
        console.log(endpointData.endpoint);
        // let arrEndpointData = endpointData.endpoint.split("/");
        // let lastInput = arrEndpointData[arrEndpointData.length - 1];
        // if ((!lastInput || lastInput[0] == "?") && arrEndpointData.length < 4) {
        //   cy.testGetAll(endpointData, JWT).then((response) => {
        //     if (response) {
        //       cy.expect(response.status).to.oneOf([200, 304]);
        //     }
        //   });
        // }
      });
    });
  });

  // it('attempt to test all "create" endpoints data', () => {
  //   Object.keys(objAllEndpoints).forEach((apiTag) => {
  //     let arrEndpoints = objAllEndpoints[apiTag];
  //     arrEndpoints.forEach((endpointData) => {
  //       let arrEndpointData = endpointData.endpoint.split("/");
  //       let lastInput = arrEndpointData[arrEndpointData.length - 1];
  //       if (lastInput && lastInput == "create") {
  //         cy.log(apiTag + ": " + endpointData.endpoint);
  //         cy.testCreate(endpointData, JWT).then((response) => {
  //           if (
  //             response &&
  //             typeof response != "undefined" &&
  //             typeof response != "string"
  //           ) {
  //             console.log(apiTag + ": " + endpointData.endpoint);
  //             console.log("response.body");
  //             console.log(response.body);
  //             cy.expect(response.status).to.oneOf([200, 304]);
  //             if (response.body && response.body.data) {
  //               objCreatedData[apiTag] = response.body.data;
  //               console.log(objCreatedData);
  //             }
  //           }
  //         });
  //       }
  //     });
  //   });
  // console.log(objCreatedData);
  // });
});

// if (lastInput && lastInput == "{id}") {
//   // console.log(apiTag + ": " + endpointData.endpoint);
//   // cy.testGetByID(endpointData, JWT).then((response) => {
//   //   // console.log(response);
//   // });
//   blnHandled = true;
// }
// if (lastInput && lastInput == "update") {
//   // cy.testUpdate(endpointData, JWT).then((response) => {
//   //   // console.log(response);
//   // });
//   blnHandled = true;
// }
// if (lastInput && lastInput == "delete") {
//   // cy.testDelete(endpointData, JWT).then((response) => {
//   //   // console.log(response);
//   // });
//   blnHandled = true;
// }
// if (!blnHandled) {
//   x++;
//   // console.log(
//   //   apiTag + ": " + endpointData.endpoint + " - " + lastInput
//   // );
// }
