/// <reference types="cypress" />

import { _settings } from "../../../settings";

describe("Test Stores", () => {
  before(() => {
    cy.fixture("users").then((user) => {
      cy.niLogin(user, _settings.baseURL);
      cy.url().should("include", "dashboard");
      // TODO: navigate to Stores (plural)
    });
  });

  it("check the carousel loads", () => {
    cy.get("app-nexusintelcarousel").should("be.visible");
  });

  // TODO: check apps display, cann install, can open app + dashboards
});
