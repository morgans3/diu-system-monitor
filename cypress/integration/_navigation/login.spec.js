/// <reference types="cypress" />

import { _settings } from "../../../settings";

describe("Test Application", () => {
    beforeEach(() => {
        cy.visit(_settings.baseURL);
    });

    it("displays login page", () => {
        cy.get("input").should("have.length", 2);
        cy.get("input").first().should("have.value", "");
        cy.get("input").last().should("have.value", "");
    });

    it("attempts login using command", () => {
        const jwttoken = ""; // TODO: where is it getting this from?!
        cy.swaggerAuth(jwttoken, "/api-docs");

        cy.fixture("users").then((user) => {
            cy.niLogin(user, _settings.baseURL);
            cy.url().should("include", "dashboard");
        });
    });
});
