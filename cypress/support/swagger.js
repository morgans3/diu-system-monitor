Cypress.Commands.add("swaggerAuth", (jwttoken, page) => {
  cy.visit(page);
  // Find the auth button
  cy.get("button").contains("Authorize").click();
  // Find the input field and type the token
  cy.get("input").type("JWT " + jwttoken);
  // Find the submit button and click it
  cy.get("button").contains("Authorize").click();
});
