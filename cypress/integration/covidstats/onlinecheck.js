/// <reference types="cypress" />
const settings = require("../../../settings").settings;

describe("Test Server is available", () => {
    it("check api responds to queries", () => {
        const query = `covid_crude_rate?` + `date_start=2021-08-01` + `&date_end=2021-08-02` + `&geo_level=ward`;
        cy.request(settings.covidstatsURL + query).then((response) => {
            expect(response.status).to.eq(200);
        });
    });
});
