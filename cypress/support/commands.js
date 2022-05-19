// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
const { faker } = require("@faker-js/faker");

Cypress.Commands.add("niLogin", (user, loginpage) => {
    cy.visit(loginpage);
    cy.get("input").first().type(user.username);
    cy.get('input[id="mat-input-1"]').type(user.password, { sensitive: true });
    cy.get("mat-select").click().type("{enter}");
    cy.get("form").submit();
});

Cypress.Commands.add("createFixture", (endpointData) => {
    const bodyParams = {};
    if (endpointData.parameters && endpointData.parameters.length) {
        endpointData.parameters.forEach((data) => {
            bodyParams[data.name] = fakerData(data);
        });
    }
    return bodyParams;
});

Cypress.Commands.add("createFailFixture", (endpointData) => {
    const bodyParams = {};
    if (endpointData.parameters && endpointData.parameters.length) {
        endpointData.parameters.forEach((data) => {
            bodyParams[data.name] = wrongFakerData(data);
        });
    }
    return bodyParams;
});

Cypress.Commands.add("getRandomString", () => {
    return fakerData({ type: "sting", name: "string" });
});

function fakerData(data) {
    switch (data.type) {
        case "integer":
        case "number":
            return faker.datatype.number().toString();
        case "boolean":
            return faker.datatype.boolean();
        case "date":
            return faker.date.recent();
        case "object": {
            const newData = {};
            const key = fakerData({ type: "string", name: "" });
            const value = fakerData({ type: "string", name: "" });
            newData['"' + key + '"'] = value;
            return newData;
        }
        case "array":
            return [];
        // return fakerData({ type: "string", name: "" }) + ", " + fakerData({ type: "string", name: "" });
        case "string":
        default:
            switch (data.name.toLowerCase()) {
                case "phone":
                case "phonenumber":
                    return faker.phone.phoneNumber();
                case "email":
                    return faker.internet.email();
                case "firstname":
                    return faker.name.firstName();
                case "lastname":
                    return faker.name.lastName();
                case "name":
                    return faker.name.firstName() + " " + faker.name.lastName();
                case "date":
                case "startdate":
                case "enddate":
                    return faker.date.recent();
                default:
                    return faker.lorem.word();
            }
    }
}

function wrongFakerData(data) {
    switch (data.type) {
        case "integer":
        case "number":
            return faker.datatype.boolean();
        case "boolean":
            return faker.datatype.number().toString();
        case "date": {
            const newData = {};
            const key = fakerData({ type: "string", name: "" });
            const value = fakerData({ type: "string", name: "" });
            newData['"' + key + '"'] = value;
            return newData;
        }
        case "object":
            return faker.date.recent();
        case "array":
            return faker.datatype.number().toString();
        case "string":
        default:
            return faker.datatype.boolean();
    }
}
