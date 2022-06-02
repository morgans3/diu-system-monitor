const { faker } = require("@faker-js/faker");

class ApiBaseClass {
    bodyParams = {
        bodyParams: {},
        bodyParamsFail: {},
        bodyParamsBadPayload: {},
    };

    foundReplacements = [];
    // TODO: replace hardcoded replaceData
    replaceData = {
        passReplaceData: {
            "{id}": "Suicide_Prevention",
        },
        failReplaceData: {
            "{id}": "vTMdCxvsDvo!%a6kTFzY4TGCxepzm%",
        },
    };

    orderedEndpointData = [];

    organiseEndpoints = {};

    constructor(swagggerData) {
        this.reorderFixtureData(swagggerData);
        this.getReplacementData(swagggerData);
        this.createFixtureData(swagggerData);
    }

    reorderFixtureData(swagggerData) {
        swagggerData.forEach((endpointData) => {
            this.organiseEndpoints[endpointData.endpoint] = false;
        });
        swagggerData.forEach((endpointData) => {
            const arrEndpointData = endpointData.endpoint.split("/");
            if (endpointData.endpoint.includes("/create")) {
                if (arrEndpointData[arrEndpointData.length - 1] === "create") {
                    this.orderedEndpointData.push(endpointData);
                    this.organiseEndpoints[endpointData.endpoint] = true;
                }
            }
        });
        swagggerData.forEach((endpointData) => {
            if (!this.organiseEndpoints[endpointData.endpoint]) {
                this.orderedEndpointData.push(endpointData);
                this.organiseEndpoints[endpointData.endpoint] = true;
            }
        });
    }

    getReplacementData(swagggerData) {
        swagggerData.forEach((endpointData) => {
            const rxp = /{([^}]+)}/g;
            let curMatch;

            while ((curMatch = rxp.exec(endpointData.endpoint))) {
                this.foundReplacements.push(curMatch[1]);
            }
        });
    }

    createFixtureData(swagggerData) {
        swagggerData.forEach((endpointData) => {
            if (endpointData.parameters && endpointData.parameters.length) {
                endpointData.parameters.forEach((data) => {
                    this.bodyParams.bodyParams[data.name] = this.fakerData(data);
                    this.bodyParams.bodyParamsFail[data.name] = this.wrongFakerData(data);
                    this.bodyParams.bodyParamsBadPayload[data.name] = this.fakerData(data);
                });
            }
        });
        const badPayloadTest = Object.keys(this.bodyParams.bodyParamsBadPayload);
        if (badPayloadTest.length > 0) {
            const key = badPayloadTest[0];
            delete this.bodyParams.bodyParamsBadPayload[key];
        }
    }

    fakerData(data) {
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
                const key = this.fakerData({ type: "string", name: "" });
                const value = this.fakerData({ type: "string", name: "" });
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
                    case "enddate":
                        return faker.date.recent();
                    default:
                        return faker.lorem.word();
                }
        }
    }

    wrongFakerData(data) {
        switch (data.type) {
            case "integer":
            case "number":
                return faker.datatype.boolean();
            case "boolean":
                return faker.datatype.number().toString();
            case "date": {
                const newData = {};
                const key = this.fakerData({ type: "string", name: "" });
                const value = this.fakerData({ type: "string", name: "" });
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
}

module.exports = ApiBaseClass;
