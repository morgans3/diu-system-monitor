/// <reference types="cypress" />

describe("Teams", () => {
    beforeEach(() => {
        cy.login(false);
        cy.visit("http://localhost:4200/teams");
    });

    it("team list works", () => {
        // Focus input
        cy.get("input[cyName='team-search']").first().focus();

        // List is present?
        cy.get("mat-option[cyName='team-name']").should("have.length.gt", 0);
    });

    it("team search works", () => {
        // Focus input
        cy.get("input[cyName='team-search']").first().focus();

        // Get first item
        cy.get("mat-option[cyName='team-name']")
            .first()
            .then((firstTeamName) => {
                // Search using first team option
                cy.get("input[cyName='team-search']").type(firstTeamName.text().trim());

                // List is present?
                cy.get("mat-option[cyName='team-name']").should("have.length.gt", 0);
            });
    });
});
