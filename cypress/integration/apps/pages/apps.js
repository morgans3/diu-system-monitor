/// <reference types="cypress" />

describe("Apps", () => {
    beforeEach(() => {
        cy.login(false);
        cy.visit("http://localhost:4200/apps");
    });

    it("has list of apps", () => {
        // Query number of tiles
        cy.get("app-application-tile").should("have.length.gt", 0);
    });

    it("each app will open", () => {
        // Awaiting changes for installations
    });
});
