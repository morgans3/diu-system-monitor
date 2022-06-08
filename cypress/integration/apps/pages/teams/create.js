/// <reference types="cypress" />

const TeamFactory = require("../../../factories/team");
describe("Teams", () => {
    beforeEach(() => {
        cy.login(false);
        cy.visit("http://localhost:4200/teams");
    });

    it("can create team", () => {
        // Click create team button
        cy.get("button").contains("Create a Team").click();

        // Get teams
        const team = TeamFactory.create();

        // Fill inputs
        cy.get("input[formControlName=name]").first().type(team.name);
        cy.get("input[formControlName=code]").first().type(team.code);
        cy.get("input[formControlName=description]").first().type(team.description);
        cy.get("mat-select[formControlName=organisationcode]").click().get("mat-option").contains(team.organisation).click();

        // Add adminstrators
        team.responsible_people.forEach((person) => {
            cy.get("button").contains("Add Administrators").click();
            cy.get("lib-user-search input[id=search2_txt]").first().type(person.username);
            cy.get(`lib-user-search mat-select[placeholder="Select an Organisation..."]`)
                .click()
                .get("mat-option")
                .contains(team.organisation)
                .click();
            cy.get("lib-user-search button").contains(" Search ").click();
            cy.get("lib-user-search mat-list > mat-list-item button").click();
        });

        cy.wait(1000);
        cy.get("button[type=submit]").click();
    });
});
