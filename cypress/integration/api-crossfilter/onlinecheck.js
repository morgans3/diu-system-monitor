/// <reference types="cypress" />
const settings = require("../../../settings").settings;
const crossfilterurls = [settings.crossfilterURL, settings.populationURL, settings.popminiURL, settings.rtsURL, settings.outbreakURL];

crossfilterurls.forEach((url) => {
    describe("Test " + url + " is available", () => {
        it("displays server page", () => {
            cy.visit(url + "api-docs/");
            cy.title().should("include", "Swagger");
        });

        it("Check API is responsive", () => {
            cy.request(url).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });
});
