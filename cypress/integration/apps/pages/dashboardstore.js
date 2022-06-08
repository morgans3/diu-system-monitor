/// <reference types="cypress" />

describe("Dashboard store", () => {
    beforeEach(() => {
        cy.login(false);
        cy.visit("http://localhost:4200/dashboardstore");
    });

    it("has list of apps", () => {
        // Query number of tiles
        cy.get("app-application-tile").should("have.length.gt", 0);
    });

    it("each app will open", () => {
        // Awaiting changes for installations
    });
});
