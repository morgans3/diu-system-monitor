/// <reference types="cypress" />

import { _settings } from "../../../settings";

describe("Test Admin", () => {
    before(() => {
        cy.fixture("users").then((user) => {
            cy.niLogin(user, _settings.baseURL);
            cy.url().should("include", "dashboard");
            // TODO: navigate to Admin
        });
    });

    it("check the carousel loads", () => {
        cy.get("app-nexusintelcarousel").should("be.visible");
    });

    // TODO: check all CRUD functions, tidy up resources at end of test
});
