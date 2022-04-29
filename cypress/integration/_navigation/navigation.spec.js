/// <reference types="cypress" />

import { _settings } from "../../../settings";

const pages = [
    {
        title: "Population Dashboard",
        href: "dashboard",
    },
    {
        title: "My Content",
        children: [
            {
                title: "Apps",
                href: "/apps",
            },
            {
                title: "Dashboards",
                href: "/dashboardstore",
            },
            {
                title: "Reports",
                href: "/reportstore",
            },
        ],
    },
    {
        title: "Teams",
        href: "Team",
    },
    {
        title: "Networks",
        href: "Network",
    },
    {
        title: "Management",
        href: "Management",
        isAdmin: true,
    },
    {
        title: "Admin",
        href: "Admin",
        isAdmin: true,
    },
];

describe("Test Navigation", () => {
    beforeEach(() => {
        cy.visit(_settings.baseURL);
    });

    it("navigates through list of pages", () => {
        cy.fixture("users").then((user) => {
            cy.niLogin(user, _settings.baseURL);
            cy.url().should("include", "dashboard");
            pages.forEach((page) => {
                if (!page.isAdmin || (page.isAdmin && user.isAdmin)) {
                    cy.get(`a[title="${page.title}"]`).click();
                    if (page.children) {
                        page.children.forEach((child) => {
                            cy.get(`a[href="${child.href}"]`).click();
                            cy.url().should("include", child.href);
                        });
                    } else {
                        cy.url().should("include", page.href);
                    }
                }
            });
        });
    });
});
