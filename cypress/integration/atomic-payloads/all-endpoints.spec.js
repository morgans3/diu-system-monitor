/// <reference types="cypress" />

const ApiBaseClass = require("../../classes/api-base-class");

describe("AtomicPayloads - All endpoints", () => {
    const tag = "AtomicPayloads";
    let AtomicPayloadData;
    let objSwaggerData = {};
    let userDetails = {};
    const JWTs = {
        userJWT: "",
        adminJWT: "",
    };

    it("Get admin/ user credentials from AWS", () => {
        cy.getAccounts().then((accountData) => {
            console.log(accountData);
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

    it("get endpoint information from swagggerjson", () => {
        cy.getSwaggerData(tag).then((swaggerData) => {
            objSwaggerData = swaggerData;
        });
    });

    it("test against each status", () => {
        AtomicPayloadData = new ApiBaseClass(objSwaggerData);
        if (AtomicPayloadData.orderedEndpointData && AtomicPayloadData.orderedEndpointData.length > 0) {
            AtomicPayloadData.orderedEndpointData.forEach((endpointData) => {
                let replaceData = {};
                // TODO: replace hardcoded replaceData
                if (endpointData.endpoint.includes("{id}")) {
                    replaceData = AtomicPayloadData.replaceData;
                }
                console.log(endpointData);
                console.log(JWTs);
                console.log(AtomicPayloadData);
                cy.testEndpointResponses(endpointData, JWTs, AtomicPayloadData.bodyParams, replaceData);
            });
        }
    });
});
