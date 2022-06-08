/// <reference types="cypress" />
const settings = require("../../../settings").settings;

describe("Test Server is available", () => {
    it("checks get CCG list method", () => {
        cy.request(settings.needURL + "get_ccg_list").then((response) => {
            expect(response.status).to.eq(200);
        });
    });

    it("checks get GP list method", () => {
        cy.request(settings.needURL + "get_gp_list").then((response) => {
            expect(response.status).to.eq(200);
        });
    });

    it("checks get CCG PCN list method", () => {
        cy.request(settings.needURL + "get_ccg_pcn_list").then((response) => {
            expect(response.status).to.eq(200);
        });
    });
});
