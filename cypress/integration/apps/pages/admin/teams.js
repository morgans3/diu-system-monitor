/// <reference types="cypress" />

const TeamFactory = require("../../../factories/team");
describe("Admin: Test teams page", () => {
    before(() => {
        cy.login(false);
        cy.visit("http://localhost:4200/admin/teams");
    });

    it("can add a new team", () => {
        // Click add button
        cy.get("button").contains("Add new").click();

        // Fill details
        const team = TeamFactory.create();
        cy.get("input[formControlName=name]").first().type(team.name);
        cy.get("input[formControlName=code]").first().type(team.code);
        team.responsible_people.forEach((person) => {
            // Type in name
            cy.get("input-chiplist[formControlName=responsiblepeople] .mat-chip-input").first().type(person.username);

            // Click enter
            cy.get("input-chiplist[formControlName=responsiblepeople] .mat-chip-input").first().type("{enter}");
        });
        cy.get("input[formControlName=organisationcode]").first().type(team.organisationcode);
        cy.get("textarea[formControlName=description]").first().type(team.description);

        // Listen for success
        cy.intercept({ method: "GET", url: "**/teams/create*" }).as("createTeam");

        // Click save button
        cy.get("button").contains("Save team").click();
        cy.wait("@createTeam").its("response.statusCode").should("eq", 200);
    });

    // it("searching list of users works", () => {
    //     //Get first table row and search
    //     cy.get(".mat-table tbody tr:first-of-type > td").first().then((firstRowName) => {
    //         //Search using first row name
    //         cy.get("input[placeholder='Search by name']").first().type(firstRowName.text().trim());

    //         //Check table has at least one row
    //         cy.get(".mat-table > tbody > tr").should("have.length.gt", 0);
    //     });
    // });

    // it("edit page works", () => {
    //     //Get first table row and click
    //     cy.get(".mat-table tbody tr:first-of-type > td").first().then((firstRowName) => {
    //         cy.get(".mat-table tbody tr:first-of-type > td button").first().then((editButton) => {
    //             //Open modal
    //             editButton.trigger('click');
    //             cy.wait(500);

    //             //Check name appears
    //             cy.get("p[cyName='name']").first().should(($p) => {
    //                 expect($p).to.contain(firstRowName.text().trim())
    //             });
    //         });
    //     });
    // });
});
