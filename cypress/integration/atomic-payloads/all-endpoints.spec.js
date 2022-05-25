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
        // if (tag == "AtomicPayloads") {
        describe("testing each endpoint located at" + tag, () => {
            let tagName = tag.replace(" ", "-").toLowerCase();
            let orderedData = require("../../fixtures/ordered-" + tagName + ".json");
            let fixtureData = require("../../fixtures/" + tagName + ".json");
            let wrongFixtureData = require("../../fixtures/wrong-" + tagName + ".json");
            if (orderedData && orderedData.length > 0) {
                orderedData.forEach((endpointData) => {
                    context(endpointData.endpoint, () => {
                        Object.keys(endpointData.responses).forEach((responseStatus) => {
                            it("should pass for status: " + responseStatus, () => {
                                // console.log(endpointData);
                                // console.log(userDetails);
                                let passParams = prepareFixtureData(fixtureData, endpointData.parameters);
                                let failParams = prepareFixtureData(wrongFixtureData, endpointData.parameters);
                                let badPayload = prepareBadFixtureData(fixtureData, endpointData.parameters);
                                const bodyParams = {
                                    bodyParams: passParams,
                                    bodyParamsFail: failParams,
                                    bodyParamsBadPayload: badPayload,
                                };
                                const rxp = /{([^}]+)}/g;
                                let curMatch;
                                let foundReplacements = [];
                                while ((curMatch = rxp.exec(endpointData.endpoint))) {
                                    foundReplacements.push(curMatch[1]);
                                }
                                let replaceData = prepareReplacementData(foundReplacements, passParams);
                                cy.testEndpointResponse(responseStatus, endpointData, JWTs, bodyParams, replaceData);
                            });
                        });
                    });
                });
            }
        });
        // }
    });
});

function prepareFixtureData(fixtureData, parameters) {
    let newFixture = {};
    if (parameters && parameters.length > 0) {
        parameters.forEach((parameter) => {
            if (fixtureData[parameter.name]) {
                newFixture[parameter.name] = fixtureData[parameter.name];
            }
        });
    }
    return newFixture;
}

function prepareBadFixtureData(parameters) {
    let newFixture = {};
    if (parameters && parameters.length > 0) {
        parameters.forEach((parameter) => {
            newFixture[parameter.name] = "papLEP5VyjVCo4";
        });
    }
    return newFixture;
}

function prepareReplacementData(foundReplacements, params) {
    let passReplaceData = {};
    let failReplaceData = {};
    if (foundReplacements && foundReplacements.length > 0) {
        foundReplacements.forEach((replacement) => {
            let parameterReplaceName = "{" + replacement + "}";
            passReplaceData[parameterReplaceName] = params[replacement];
            failReplaceData[parameterReplaceName] = "papLEP5VyjVCo4";
        });
    }
    return { failReplaceData, passReplaceData };
}
