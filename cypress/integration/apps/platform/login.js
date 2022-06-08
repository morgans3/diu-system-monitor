/// <reference types="cypress" />

describe("Test App", () => {
    beforeEach(() => {
        cy.visit("http://localhost:4200");
    });

    it("displays login page", () => {
        cy.get("input").should("have.length", 2);
        cy.get("input").first().should("have.value", "");
        cy.get("input").last().should("have.value", "");
    });

    it("attempts login", () => {
        cy.login(false).then(() => {
            cy.url().should("include", "landing");
        });
    });
});
