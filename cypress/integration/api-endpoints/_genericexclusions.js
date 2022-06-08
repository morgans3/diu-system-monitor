const deletionExclusionList = [
    "Cohorts",
    "CVICohorts",
    "TeamRequests",
    "Teams",
    "Capabilities",
    "Organisations", // TODO: check why this is in the exclusion list
    "Roles", // TODO: check why this is in the exclusion list
    "TeamMembers",
    "UserProfiles", // TODO: check why this is in the exclusion list
    "Users",
];
const putExclusionList = [
    "Cohorts",
    "CVICohorts",
    "Password",
    "TeamMembers",
    "TeamRequests",
    "Teams",
    "Capabilities", // TODO: check why this is in the exclusion list
    "Roles", // TODO: check why this is in the exclusion list
    "UserProfiles", // TODO: check why this is in the exclusion list
    "VirtualWards", // TODO: check why this is in the exclusion list
    "Dashboards", // TODO: check why this is in the exclusion list
    "Organisations", // TODO: check why this is in the exclusion list
    "SystemAlerts", // TODO: check why this is in the exclusion list
];
const postExclusionList = [
    "Demographics",
    "Docobo",
    "TeamMembers",
    "MFA",
    "ServiceAccounts",
    "GPInpatients",
    "GovUKNotify",
    "NICEEvidenceSearch",
    "Capabilities", // TODO: check why this is in the exclusion list
    "Roles", // TODO: check why this is in the exclusion list
    "Teams",
    "UserProfiles",
    "Requests",
    "DocoboOutbound",
    "HouseholdIsochrone", // TODO: check why this is in the exclusion list
    "Trials",
    "Users",
    "VirtualWards", // TODO: check why this is in the exclusion list
];
const exclusionList = ["Demographics", "Docobo", "DocoboOutbound", "MFA", "PostCodes", "Trials", "Users", "SearchUsers"];
const getByParamsExclusionList = ["Confluence", "Capabilities", "Roles", "UserProfiles"]; // TODO: check why these are in the exclusion list

const isInExclusionList = (tag) => {
    return exclusionList.includes(tag);
};

const isInDeletionExclusionList = (tag) => {
    return deletionExclusionList.includes(tag);
};

const isInPutExclusionList = (tag) => {
    return putExclusionList.includes(tag);
};

const isInPOSTExclusionList = (tag) => {
    return postExclusionList.includes(tag);
};

const isInGetByParamsExclusionList = (tag) => {
    return getByParamsExclusionList.includes(tag);
};

module.exports.Exclusions = {
    isInExclusionList,
    isInDeletionExclusionList,
    isInPutExclusionList,
    isInPOSTExclusionList,
    isInGetByParamsExclusionList,
};
