/// <reference types="cypress" />
const settings = require("../../../settings").settings;

describe("Test Server is available", () => {
    it("displays server page", () => {
        cy.visit(settings.geoserverURL);
        cy.title().should("include", "Apache Tomcat");

        cy.visit(settings.geoserverURL + "geoserver/web/");
        cy.title().should("include", "GeoServer");
    });
});
