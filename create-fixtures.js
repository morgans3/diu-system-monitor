const { faker } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const createFixtureData = (bodyData) => {
    const swagggerData = {};
    const bodyParams = {
        bodyParams: {},
        bodyParamsFail: {},
        bodyParamsBadPayload: {},
    };
    const swaggerPathData = JSON.parse(bodyData).paths;
    Object.keys(swaggerPathData).forEach((endpoint) => {
        Object.keys(swaggerPathData[endpoint]).forEach((requestType) => {
            const APIInformation = swaggerPathData[endpoint][requestType];
            APIInformation["endpoint"] = endpoint;
            APIInformation["requestType"] = requestType;
            if (swagggerData[APIInformation["tags"][0]] !== undefined) {
                swagggerData[APIInformation["tags"][0]].push(APIInformation);
            } else {
                swagggerData[APIInformation["tags"][0]] = [APIInformation];
            }
        });
    });
    Object.keys(swagggerData).forEach((tagName) => {
        swagggerData[tagName].forEach((endpointData) => {
            if (endpointData.parameters && endpointData.parameters.length) {
                endpointData.parameters.forEach((data) => {
                    if (!bodyParams.bodyParams[endpointData.tags[0]]) {
                        bodyParams.bodyParams[endpointData.tags[0]] = {};
                    }
                    bodyParams.bodyParams[endpointData.tags[0]][data.name] = fakerData(data);
                    if (!bodyParams.bodyParamsFail[endpointData.tags[0]]) {
                        bodyParams.bodyParamsFail[endpointData.tags[0]] = {};
                    }
                    bodyParams.bodyParamsFail[endpointData.tags[0]][data.name] = wrongFakerData(data);
                    // if (!bodyParams.bodyParamsBadPayload[endpointData.tags[0]]) {
                    //     bodyParams.bodyParamsBadPayload[endpointData.tags[0]] = {};
                    // }
                    // bodyParams.bodyParamsBadPayload[endpointData.tags[0]][data.name] = fakerData(data);
                });
            }
        });
    });
    Object.keys(bodyParams.bodyParams).forEach((key) => {
        let fileName = path.join(__dirname, "/cypress/fixtures/", key.toLowerCase() + ".json");

        fileName = fileName.replace(" ", "-");
        fs.writeFile(fileName, JSON.stringify(bodyParams.bodyParams[key]), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
    Object.keys(bodyParams.bodyParamsFail).forEach((key) => {
        let fileName = path.join(__dirname, "/cypress/fixtures/", "wrong-" + key.toLowerCase() + ".json");
        fileName = fileName.replace(" ", "-");
        fs.writeFile(fileName, JSON.stringify(bodyParams.bodyParams[key]), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
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
        // return fakerData({ type: "string", name: "" }) + ", " + fakerData({ type: "string", name: "" });
        case "string":
            switch (data.name.toLowerCase()) {
                case "phone":
                case "phonenumber":
                case "phone_number":
                case "tel":
                    return faker.phone.phoneNumber();
                case "email":
                case "emailaddress":
                case "email_address":
                    return faker.internet.email();
                case "firstname":
                    return faker.name.firstName();
                case "lastname":
                    return faker.name.lastName();
                case "name":
                    return faker.name.firstName() + " " + faker.name.lastName();
                case "date":
                case "startdate":
                case "start_date":
                case "enddate":
                case "end_date":
                case "datefrom":
                case "date_from":
                case "dateto":
                case "date_to":
                    return faker.date.recent();
                case "_id":
                case "id":
                    return uuidv4();
                default:
                    return faker.lorem.word();
            }
        case "":
        default:
            if (data.schema) {
                const fakerObject = {};
                if (data.schema.properties) {
                    Object.keys(data.schema.properties).forEach((property) => {
                        fakerObject[property] = fakerData({ type: data.schema.properties[property].type, name: property });
                    });
                }
                const returnData = {};
                returnData[data.name] = fakerObject;
                return fakerObject;
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

module.exports.createFixtureData = createFixtureData;
