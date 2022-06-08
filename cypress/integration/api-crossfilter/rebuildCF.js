/// <reference types="cypress" />
const settings = require("../../../settings").settings;
const crossfilterurls = [settings.crossfilterURL, settings.populationURL, settings.popminiURL, settings.rtsURL, settings.outbreakURL];
const JWTs = {
    userJWT: "",
};

before(() => {
    cy.fixture("secrets/cypressaccounts").then((userDetails) => {
        const userData = {
            username: userDetails.username,
            password: userDetails.password,
            organisation: "Collaborative Partners",
            authentication: "Demo",
        };
        cy.getJWT(userData).then((jwtToken) => {
            JWTs.userJWT = "JWT " + jwtToken;
        });
    });
});

crossfilterurls.forEach((url) => {
    describe("Test " + url + " is available", () => {
        it("displays server page", () => {
            cy.visit(url + "api-docs/");
            cy.title().should("include", "Swagger");
        });

        it("Test rebuild of crossfilter", () => {
            cy.simplifiedAPIRequest(url + "dataset/rebuildCrossfilter", "get", JWTs.userJWT).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });
});
