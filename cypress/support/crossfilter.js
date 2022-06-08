Cypress.Commands.add("simplifiedAPIRequest", (url, method, Authorization, body) => {
    const requestConfig = {
        method,
        url,
        failOnStatusCode: false,
    };
    if (Authorization) requestConfig.headers = { Authorization };
    if (body) requestConfig.body = body;
    cy.request(requestConfig).then((response) => {
        return response;
    });
});
