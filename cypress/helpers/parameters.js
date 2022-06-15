const { faker } = require("@faker-js/faker");

const newBodyParameters = function (endpoint, endpoints) {
    const newParams = {};
    const endpointTag = endpoint.tags[0];
    const createEndpoint = endpoints.find((point) => point.endpoint.includes("/create") && point.tags[0] === endpointTag);
    if (createEndpoint.parameters && createEndpoint.parameters.length) {
        createEndpoint.parameters.forEach((data) => {
            newParams[data.name] = fakerData(data);
        });
    }
    return newParams;
};

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
        case "string":
        default:
            if (data.name.toLowerCase().includes("date")) {
                return faker.date.recent();
            }
            return faker.name.firstName() + "#" + faker.name.lastName();
    }
}

module.exports.Modifiers = {
    newBodyParameters,
};
