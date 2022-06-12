// @ts-check

const baseURL = process.env.BASE_URL || "dev.nexusintelligencenw.nhs.uk";
module.exports.settings = {
    apiURL: process.env.API_URL || "https://api." + baseURL,
    appURL: process.env.APP_URL || "https://www." + baseURL + "/",
    shinyURL: process.env.SHINY_URL || "https://shiny." + baseURL + "/",
    crossfilterURL: process.env.CROSSFILTER_URL || "https://crossfilter." + baseURL + "/",
    populationURL: process.env.POPULATION_URL || "https://population." + baseURL + "/",
    popminiURL: process.env.POPMINI_URL || "https://popmini." + baseURL + "/",
    rtsURL: process.env.RTS_URL || "https://rts." + baseURL + "/",
    outbreakURL: process.env.OUTBREAK_URL || "https://outbreak." + baseURL + "/",
    otpURL: process.env.OTP_URL || "https://isochrone." + baseURL + "/",
    covidstatsURL: process.env.COVIDSTATS_URL || "https://covidstats." + baseURL + "/",
    needURL: process.env.NEED_URL || "https://need." + baseURL + "/",
    geoserverURL: process.env.GEOSERVER_URL || "https://geoserver." + baseURL + "/",
};
