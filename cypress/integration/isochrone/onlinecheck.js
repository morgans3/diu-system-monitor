/// <reference types="cypress" />
const settings = require("../../../settings").settings;

describe("Test Server is available", () => {
    it("displays server page", () => {
        cy.visit(settings.otpURL);
        cy.title().should("include", "My OTP Instance");
    });

    it("checks isochrone responds to queries", () => {
        const query =
            `otp/routers/lsc/isochrone?fromPlace=53.74404,-2.99824&date=2022/04/28` +
            `&time=12:00:00` +
            `&maxWalkDistance=1000` +
            `&mode=WALK` +
            `&cutoffSec=1800&cutoffSec=3600`;
        cy.request(settings.otpURL + query).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.type).to.be.eq("FeatureCollection");
        });
    });
});
