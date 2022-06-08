/// <reference types="cypress" />
const NumberHelper = require("../../helpers/number");

describe("Test profile page", () => {
    before(() => {
        cy.login(false);
    });

    it("displays profile page", () => {
        cy.get(`a[href*="profile"]`).click();
        cy.url().should("include", "profile");
    });

    // TODO: Add test to check that the page displays the correct user information for the logged in user

    it("user can update details", () => {
        // Generate phone number
        const newPhoneNumber = NumberHelper.rand(10);

        // Edit contact number and save
        cy.log("Changing phone number...");
        cy.get("input[formcontrolname=contactnumber]").type(newPhoneNumber);

        cy.intercept("POST", "/userprofiles/create*").as("createProfile");

        cy.get("button[type=submit]").click();

        cy.wait("@createProfile").then((interception) => {
            cy.expect(interception.response.statusCode).to.equal(200);
        });
    });

    // TODO: Add tests for functions for capabilties, roles, installations, etc.
});
