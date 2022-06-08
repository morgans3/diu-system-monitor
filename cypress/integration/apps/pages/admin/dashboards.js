/// <reference types="cypress" />

describe("Admin: Test dashboards page", () => {
    before(() => {
        cy.login(false);
        cy.visit("http://localhost:4200/admin/dashboards");
    });

    it("displays a list of dashboards", () => {
        // Check table has at least one row
        cy.get(".mat-table > tbody > tr").should("have.length.gt", 0);
    });

    it("searching list of dashboards works", () => {
        // Get first table row and search
        cy.get(".mat-table tbody tr:first-of-type > td")
            .first()
            .then((firstRowName) => {
                // Search using first row name
                cy.get("input[placeholder='Search by name']").first().type(firstRowName.text().trim());

                // Check table has at least one row
                cy.get(".mat-table > tbody > tr").should("have.length.gt", 0);
            });
    });

    it("edit modal works", () => {
        // Get first table row and click
        cy.get(".mat-table tbody tr:first-of-type > td button")
            .first()
            .then((editButton) => {
                // Open modal
                editButton.trigger("click");

                // Input has value
                cy.get("admin-dashboard-modal input[formcontrolname='name']").invoke("val").should("not.be.empty");
            });
    });
});
