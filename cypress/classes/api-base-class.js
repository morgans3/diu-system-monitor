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

    getAllTags = {};

    constructor(swagggerData) {
        this.reorderFixtureData(swagggerData);
        this.getReplacementData(swagggerData);
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
            const arrEndpointData = endpointData.endpoint.split("/");
            if (!this.organiseEndpoints[endpointData.endpoint]) {
                if (!endpointData.endpoint.includes("/delete")) {
                    if (arrEndpointData[arrEndpointData.length - 1] !== "delete") {
                        if (this.isGetAll(arrEndpointData)) {
                            this.getAllTags[endpointData.tags[0]] = endpointData;
                        }
                        this.orderedEndpointData.push(endpointData);
                        this.organiseEndpoints[endpointData.endpoint] = true;
                    }
                }
            }
        });
        swagggerData.forEach((endpointData) => {
            const arrEndpointData = endpointData.endpoint.split("/");
            if (!this.organiseEndpoints[endpointData.endpoint]) {
                if (endpointData.endpoint.includes("/delete")) {
                    if (arrEndpointData[arrEndpointData.length - 1] === "delete") {
                        this.orderedEndpointData.push(endpointData);
                        this.organiseEndpoints[endpointData.endpoint] = true;
                    }
                }
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

    isGetAll(arrEndpointData) {
        if (arrEndpointData.length === 2 && arrEndpointData[0] === "") {
            return true;
        }
        if (arrEndpointData.length === 3 && arrEndpointData[0] === "" && arrEndpointData[2] === "") {
            return true;
        }
        if (
            arrEndpointData.length === 3 &&
            arrEndpointData[0] === "" &&
            arrEndpointData[1] === "atomic" &&
            arrEndpointData[2] === "payloads"
        ) {
            return true;
        }
        if (
            arrEndpointData.length === 3 &&
            arrEndpointData[0] === "" &&
            arrEndpointData[1] === "atomic" &&
            arrEndpointData[2] === "formdata"
        ) {
            return true;
        }
        return false;
    }
}

module.exports = ApiBaseClass;
