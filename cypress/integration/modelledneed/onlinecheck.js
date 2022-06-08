/// <reference types="cypress" />
const settings = require("../../../settings").settings;

describe("Test Server is available", () => {
    it("displays server page", () => {
        cy.visit(settings.needURL + "__docs__/");
        cy.title().should("include", "Swagger");
    });

    it("Check API is responsive", () => {
        cy.request(settings.needURL + "ping").then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.include("Who dares disturb my slumber?");
        });
    });
});
