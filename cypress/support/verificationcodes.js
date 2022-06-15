import { settings } from "../../settings";

Cypress.Commands.add("generateVerificationCode", () => {
    const requestConfig = {
        method: "post",
        url: settings.apiURL + "/users/send-code",
        body: {
            email: "nexus.intelligencenw@nhs.net",
        },
    };
    cy.request(requestConfig).then((response) => {
        return response;
    });
});

Cypress.Commands.add("getVerificationCode", () => {
    cy.fixtures("secrets/email").then((emailInfo) => {
        const username = emailInfo.EMAIL_USERNAME;
        const password = emailInfo.EMAIL_PASSWORD;
        const verificationCode = "";
        cy.visit("https://email.nhs.net/");
        cy.get("form input[name=UserName]").type(username);
        cy.get("form input[name=Password]").type(password);
        cy.get("form").submit();
        cy.wait(10000);
        // TODO: Read email that has verification code
        // THIS DOESN'T WORK, WEB OUTLOOK IS GIBBERISH AND CHECKS LOGIN ON EACH COMPUTER/SESSION
        // GO THE DIRECT READ ROUTE
        return verificationCode;
    });
});
