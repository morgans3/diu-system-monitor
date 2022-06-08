/// <reference types="cypress" />
const settings = require("../../../settings").settings;
const crossfilterurls = [settings.rtsURL];
const JWTs = {
    userJWT: "",
};

before(() => {
    cy.fixture("secrets/cypressaccounts").then((userDetails) => {
        const userData = {
            username: userDetails.username,
            password: userDetails.password,
            organisation: "Collaborative Partners",
            authentication: "Demo",
        };
        cy.getJWT(userData).then((jwtToken) => {
            JWTs.userJWT = "JWT " + jwtToken;
        });
    });
});

crossfilterurls.forEach((url) => {
    describe("Test " + url + " is available", () => {
        let newItem = {};
        it("displays server page", () => {
            cy.visit(url + "api-docs/");
            cy.title().should("include", "Swagger");
        });

        it("create test data", () => {
            cy.fixture("examples/rts").then((rts) => {
                newItem = rts;
            });
        });

        it("Test registering a new item", () => {
            cy.simplifiedAPIRequest(url + "dataset/register", "post", JWTs.userJWT, newItem).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it("Test updating an existing item", () => {
            cy.simplifiedAPIRequest(url + "dataset/update", "put", JWTs.userJWT, newItem).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it("Test removing an item", () => {
            cy.simplifiedAPIRequest(url + "dataset/remove", "delete", JWTs.userJWT, newItem).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });
});
