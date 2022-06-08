class ApiBaseClass {
    orderedEndpointData = [];

    constructor(swagggerData) {
        this.reorderFixtureData(swagggerData);
    }

    reorderFixtureData(swagggerData) {
        let organiseEndpoints = [];
        const orderedArray = [
            { condition: "includes", value: "/create" },
            { condition: "notincludes", value: "/delete" },
            { condition: "includes", value: "/delete" },
        ];
        orderedArray.forEach((order) => {
            const matches = swagggerData.filter((endpoint) => {
                return order.condition === "includes" ? endpoint.endpoint.includes(order.value) : !endpoint.endpoint.includes(order.value);
            });
            swagggerData = swagggerData.filter((endpoint) => {
                return !matches.includes(endpoint);
            });
            organiseEndpoints = organiseEndpoints.concat(matches);
        });
        this.orderedEndpointData = organiseEndpoints;
    }
}

module.exports = ApiBaseClass;
