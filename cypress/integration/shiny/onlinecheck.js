/// <reference types="cypress" />
const settings = require("../../../settings").settings;

describe("Test Shiny Server is available", () => {
    it("displays server page", () => {
        cy.visit(settings.shinyURL);
        cy.title().should("include", "Shiny Server");
    });

    it("checks Virtual Ward dashboard is online", () => {
        cy.visit(settings.shinyURL + "/virtual_wardy/");
        cy.title().should("include", "COVID Oximetry");
    });
});
