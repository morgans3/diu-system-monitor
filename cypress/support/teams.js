import { settings } from "../../settings";

Cypress.Commands.add("makeShellTeam", (username, JWT) => {
    console.log(username);
    const requestConfig = {
        method: "post",
        url: settings.baseURL + "/teams/create",
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
        url: settings.baseURL + "/teams/delete",
        headers: {
            Authorization: JWT,
        },
        body: {
            _id: team["_id"],
            code: team.code,
        },
    };
    cy.request(requestConfig).then((response) => {
        return response;
    });
});
