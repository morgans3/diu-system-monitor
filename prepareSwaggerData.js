const { v4: uuidv4 } = require("uuid");
const http = require("http");
const fs = require("fs");
const { faker } = require("@faker-js/faker");

let dataForLoop = [];
let swagggerJSON = [];
http.get("http://localhost:8079/swagggerjson", (resp) => {
    let data = "";

    // A chunk of data has been received.
    resp.on("data", (chunk) => {
        data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on("end", () => {
        //Store the swagger data in a file for tests to load
        fs.writeFile(__dirname + "/cypress/fixtures/swagggerData.json", data, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            //file written successfully
        });

        // prepare the swaggger data to make it easier to create fixtures
        let swagggerData = {};
        const swaggerPathData = JSON.parse(data).paths;
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
        let tagData = [];
        // create the fixtures for the tests
        Object.keys(swagggerData).forEach((endpointData) => {
            if (tagData.indexOf(endpointData) === -1) {
                tagData.push(endpointData);
            }
            let fixtureData = {};
            let wrongFixtureData = {};
            swagggerData[endpointData].forEach((endpoint) => {
                // console.log(endpoint.parameters);
                if (endpoint.parameters && endpoint.parameters.length > 0) {
                    endpoint.parameters.forEach((parameter) => {
                        fixtureData[parameter.name] = fakerData(parameter);
                        wrongFixtureData[parameter.name] = wrongFakerData(parameter);
                    });
                }
            });
            let fileName = __dirname + "/cypress/fixtures/" + endpointData.toLowerCase() + ".json";
            fileName = fileName.replace(" ", "-");
            fs.writeFile(fileName, JSON.stringify(fixtureData), (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                //file written successfully
            });
            let wrongfileName = __dirname + "/cypress/fixtures/wrong-" + endpointData.toLowerCase() + ".json";
            wrongfileName = wrongfileName.replace(" ", "-");
            fs.writeFile(wrongfileName, JSON.stringify(wrongFixtureData), (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                //file written successfully
            });

            const orderedEndpointData = organiseEndpoints(swagggerData[endpointData]);
            let orderedFileName = __dirname + "/cypress/fixtures/ordered-" + endpointData.toLowerCase() + ".json";
            orderedFileName = orderedFileName.replace(" ", "-");
            fs.writeFile(orderedFileName, JSON.stringify(orderedEndpointData), (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                //file written successfully
            });
        });
        let tagFileName = __dirname + "/cypress/fixtures/allTags.json";
        console.log(tagData);
        fs.writeFile(tagFileName, JSON.stringify(tagData), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            //file written successfully
        });
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
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
                let fakerObject = {};
                if (data.schema.properties) {
                    console.log(data.schema.properties);
                    Object.keys(data.schema.properties).forEach((property) => {
                        fakerObject[property] = fakerData({ type: data.schema.properties[property].type, name: property });
                    });
                }
                let returnData = {};
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
            return faker.datatype.number();
    }
}

function organiseEndpoints(swagggerData) {
    let orderedEndpointData = [];
    let organiseEndpoints = {};
    swagggerData.forEach((endpointData) => {
        organiseEndpoints[endpointData.endpoint] = false;
    });
    swagggerData.forEach((endpointData) => {
        const arrEndpointData = endpointData.endpoint.split("/");
        if (endpointData.endpoint.includes("/create")) {
            if (arrEndpointData[arrEndpointData.length - 1] === "create") {
                orderedEndpointData.push(endpointData);
                organiseEndpoints[endpointData.endpoint] = true;
            }
        }
    });
    swagggerData.forEach((endpointData) => {
        if (!organiseEndpoints[endpointData.endpoint]) {
            orderedEndpointData.push(endpointData);
            organiseEndpoints[endpointData.endpoint] = true;
        }
    });
    return orderedEndpointData;
}
