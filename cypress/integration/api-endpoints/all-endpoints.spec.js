/// <reference types="cypress" />
const tagData = require("../../fixtures/allTags.json");

context("Prepare Data and test all endpoints", () => {
    let userDetails = {};
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
    tagData.forEach((tag) => {
        if (tag !== "PostCodes" && tag === "Teams") {
            describe("testing each endpoint located at" + tag, () => {
                const tagName = tag.replace(" ", "-").toLowerCase();
                const orderedData = require("../../fixtures/ordered-" + tagName + ".json");
                const fixtureData = require("../../fixtures/" + tagName + ".json");
                const wrongFixtureData = require("../../fixtures/wrong-" + tagName + ".json");
                if (orderedData && orderedData.length > 0) {
                    orderedData.forEach((endpointData) => {
                        const passParams = prepareFixtureData(fixtureData, endpointData.parameters);
                        const failParams = prepareFixtureData(wrongFixtureData, endpointData.parameters);
                        const badPayload = prepareBadFixtureData(fixtureData, endpointData.parameters);
                        const bodyParams = {
                            bodyParams: passParams,
                            bodyParamsFail: failParams,
                            bodyParamsBadPayload: badPayload,
                        };
                        context(endpointData.endpoint, () => {
                            const arrResponses = [];
                            Object.keys(endpointData.responses).forEach((responseStatus) => {
                                if (responseStatus !== "200") {
                                    arrResponses.push(responseStatus);
                                }
                            });
                            Object.keys(endpointData.responses).forEach((responseStatus) => {
                                if (responseStatus === "200") {
                                    arrResponses.push(responseStatus);
                                }
                            });
                            arrResponses.forEach((responseStatus) => {
                                it("should pass for status: " + responseStatus, () => {
                                    const rxp = /{([^}]+)}/g;
                                    let curMatch;
                                    const foundReplacements = [];
                                    while ((curMatch = rxp.exec(endpointData.endpoint))) {
                                        foundReplacements.push(curMatch[1]);
                                    }
                                    const replaceData = prepareReplacementData(foundReplacements, fixtureData);
                                    cy.log(bodyParams);
                                    cy.testEndpointResponse(responseStatus, endpointData, JWTs, bodyParams, replaceData).then(
                                        (response) => {
                                            console.log(response);
                                            cy.log(response);
                                            if (
                                                responseStatus === 200 &&
                                                response.status === 200 &&
                                                endpointData.endpoint.indexOf("/create") !== -1 &&
                                                response.body.data
                                            ) {
                                                bodyParams.bodyParams = response.body.data;
                                                if (bodyParams.bodyParams["_id"]) {
                                                    bodyParams.bodyParams.id = bodyParams.bodyParams["_id"];
                                                    delete bodyParams.bodyParams["_id"];
                                                }
                                                console.log(bodyParams);
                                                cy.log(bodyParams);
                                            }
                                        }
                                    );
                                });
                            });
                        });
                    });
                }
            });
        }
    });
});

function prepareFixtureData(fixtureData, parameters) {
    const newFixture = {};
    if (parameters && parameters.length > 0) {
        parameters.forEach((parameter) => {
            if (fixtureData[parameter.name] !== undefined) {
                newFixture[parameter.name] = fixtureData[parameter.name];
            }
        });
    }
    return newFixture;
}

function prepareBadFixtureData(parameters) {
    return {};
}

function prepareReplacementData(foundReplacements, params) {
    const passReplaceData = {};
    const failReplaceData = {};
    if (foundReplacements && foundReplacements.length > 0) {
        foundReplacements.forEach((replacement) => {
            const parameterReplaceName = "{" + replacement + "}";
            passReplaceData[parameterReplaceName] = params[replacement];
            failReplaceData[parameterReplaceName] = "papLEP5VyjVCo4";
        });
    }
    return { failReplaceData, passReplaceData };
}
