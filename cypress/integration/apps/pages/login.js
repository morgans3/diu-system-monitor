/// <reference types="cypress" />
const settings = require("../../../../settings").settings;

describe("Test App", () => {
    before(() => {
        cy.visit(settings.appURL);
    });

    it("displays login page", () => {
        cy.get("input").should("have.length", 2);
        cy.get("input").first().should("have.value", "");
        cy.get("input").last().should("have.value", "");
    });

    it("attempts login", () => {
        cy.fixture("secrets/cypressaccounts").then((userDetails) => {
            cy.niLogin(userDetails, settings.appURL);
        });
    });
});
