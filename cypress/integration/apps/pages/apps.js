/// <reference types="cypress" />
const settings = require("../../../../settings").settings;

describe("Dashboard store", () => {
    before(() => {
        cy.visit(settings.appURL);
        cy.fixture("secrets/cypressaccounts").then((userDetails) => {
            cy.niLogin(userDetails, settings.appURL);
        });
    });

    it("displays dashboard store page", () => {
        cy.get(`a[href*="apps"]`).click({ force: true });
        cy.url().should("include", "apps");
    });

    it("has list of dashboards", () => {
        // Query number of tiles
        cy.get("app-application-tile").should("have.length.gt", 0);
    });

    it("each dashboard will open", () => {
        // Awaiting changes for installations
    });
});
