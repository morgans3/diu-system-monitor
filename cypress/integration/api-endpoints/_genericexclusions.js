const manualTestList = [
    "AccessLogs",
    "Capabilities",
    "Cohorts",
    "CVICohorts",
    "Demographics",
    "Docobo",
    "DocoboOutbound",
    "GovUKNotify",
    "GPInpatients",
    "HouseholdIsochrone",
    "LPRESViewer",
    "MFA",
    "NICEEvidenceSearch",
    "OpenSource",
    "Password",
    "PostCodes",
    "Requests",
    "Roles",
    "SearchUsers",
    "ServiceAccounts",
    "TeamMembers",
    "TeamRequests",
    "Teams",
    "Trials",
    "Users",
    "VirtualWards",
];

const isInExclusionList = (tag) => {
    return manualTestList.includes(tag);
};

const getByParamsList = ["Confluence", "Mosaic", "PatientHistory", "PatientLists", "SearchTeams"];

const getByParamsGenericList = (tag) => {
    return getByParamsList.includes(tag);
};

module.exports.Exclusions = {
    isInExclusionList,
    getByParamsGenericList,
};
