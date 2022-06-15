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

const replaceParameters = function (endpoint, isBadParmaters) {
    const output = JSON.parse(JSON.stringify(endpoint));
    if (isBadParmaters) {
        output.parameters.forEach((data) => {
            output.endpoint.includes("{")
                ? (output.endpoint = output.endpoint.replace("{" + data.name + "}", "0"))
                : (output.endpoint = addParamToRequest(output.endpoint, data, "0"));
        });
    } else {
        output.parameters.forEach((data) => {
            output.endpoint.includes("{")
                ? (output.endpoint = output.endpoint.replace("{" + data.name + "}", data.example.toString().replace("#", "%23")))
                : (output.endpoint = addParamToRequest(output.endpoint, data, data.example));
        });
    }
    console.log(output);
    return output;
};

function addParamToRequest(endpoint, data, value) {
    endpoint.includes("?") ? (endpoint += "&" + data.name + "=" + value) : (endpoint += "?" + data.name + "=" + value);
    return endpoint;
}

module.exports.Modifiers = {
    newBodyParameters,
    replaceParameters,
};
