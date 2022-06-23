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

    getAllTags = {};

    constructor(swagggerData) {
        this.reorderFixtureData(swagggerData);
        this.getReplacementData(swagggerData);
    }

    reorderFixtureData(swagggerData) {
        const orderedArray = [
            { condition: "includes", value: "/create" },
            { condition: "notincludes", value: "/delete" },
            { condition: "includes", value: "/delete" },
        ];
        orderedArray.forEach((order) => {
            const matches = swagggerData.filter((endpoint) => {
                return order.condition === "includes" ? endpoint.endpoint.includes(order.value) : !endpoint.endpoint.includes(order.value);
            });
            this.orderedEndpointData = this.orderedEndpointData.concat(matches);
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
