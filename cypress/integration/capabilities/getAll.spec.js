/// <reference types="cypress" />

import { _settings } from "../../../settings";

const endpoint = "/capabilities";
const containerID = "#operations-Capabilities-get_capabilities";
const keys = ["id"];

describe("Test Application", () => {
  beforeEach(() => {
    cy.visit(_settings.baseURL + "/api-docs");
  });

  it("attempt to get all  capabilities", () => {
    cy.getAll(endpoint, containerID, keys);
  });
});
