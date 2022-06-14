const { faker } = require("@faker-js/faker");

const newBodyParameters = function (endpoint, endpoints) {
    const newParams = {};
    const endpointTag = endpoint.tags[0];
    console.log(endpoints);
    const createEndpoint = endpoints.find((point) => point.endpoint.includes("/create") && point.tags[0] === endpointTag);
    console.log(createEndpoint);
    if (createEndpoint.parameters && createEndpoint.parameters.length) {
        createEndpoint.parameters.forEach((data) => {
            newParams[data.name] = fakerData(data);
        });
    }
    return newParams;
};

const modifyBodyParameters = function (endpoint, ignoreIDFields) {
    const previousObject = Object.clone(endpoint.bodyParams);
    if (!previousObject) return {};
    const ids = endpoint.parameters;
    console.log(ids);
    const objectKeys = Object.keys(previousObject);
    objectKeys.forEach((key) => {
        if (ids.includes(key) && ignoreIDFields) return;
        previousObject[key] = modifyFakeValue(previousObject[key]);
    });
    return previousObject;
};

function modifyFakeValue(value) {
    if (typeof value === "string") {
        return value + "fake";
    }
    if (typeof value === "object") {
        const objectKeys = Object.keys(value);
        objectKeys.forEach((key) => {
            value[key] = modifyFakeValue(value[key]);
        });
        return value;
    }
    if (typeof value === "number") {
        return value + 1;
    }
    if (typeof value === "boolean") {
        return !value;
    }
}

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
    modifyBodyParameters,
};
