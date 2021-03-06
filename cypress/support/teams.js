import { settings } from "../../settings";

Cypress.Commands.add("makeShellTeam", (username, JWT) => {
    console.log(username);
    const requestConfig = {
        method: "post",
        url: settings.apiURL + "/teams/create",
        headers: {
            Authorization: JWT,
        },
        body: {
            code: "RandomTestTeam",
            name: "RandomTestTeam",
            description: "Shell Team to Test Codebase",
            organisationcode: "Admin",
            responsiblepeople: [username],
        },
    };
    cy.request(requestConfig).then((response) => {
        return response;
    });
});

Cypress.Commands.add("deleteShellTeam", (team, JWT) => {
    console.log(team);
    const requestConfig = {
        method: "delete",
        url: settings.apiURL + "/teams/delete",
        headers: {
            Authorization: JWT,
        },
        body: {
            id: team.id,
            code: team.code,
        },
    };
    cy.request(requestConfig).then((response) => {
        return response;
    });
});
