/// <reference types="cypress" />

import { _settings } from "../../../settings";

describe("Test Dashboard", () => {
  before(() => {
    cy.fixture("users").then((user) => {
      cy.niLogin(user, _settings.baseURL);
      cy.url().should("include", "dashboard");
    });
  });

  it("check the carousel loads", () => {
    cy.get("app-nexusintelcarousel").should("be.visible");
  });

  it("check the population health dashboard loads", () => {
    cy.get("app-population").should("be.visible");
    // TODO: test mini CF filter functions works
  });

  it("check the twitter newsfeed loads", () => {
    cy.get("app-dashboard-twitter").should("be.visible");
  });
});
