const deletionExclusionList = [
    "Cohorts",
    "CVICohorts",
    "TeamRequests",
    "Teams",
    "Capabilities",
    "NewsFeeds",
    "Organisations",
    "Roles",
    "TeamMembers",
    "UserProfiles",
    "Users",
];
const putExclusionList = [
    "Cohorts",
    "CVICohorts",
    "Password",
    "TeamMembers",
    "TeamRequests",
    "Teams",
    "Capabilities",
    "Roles",
    "UserProfiles",
    "VirtualWards",
    "Dashboards",
    "NewsFeeds",
    "Organisations",
    "SystemAlerts",
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
    "Capabilities",
    "Roles",
    "Teams",
    "UserProfiles",
    "Requests",
    "DocoboOutbound",
    "HouseholdIsochrone",
    "Trials",
    "Users",
    "VirtualWards",
];
const exclusionList = ["Demographics", "Docobo", "DocoboOutbound", "MFA", "PostCodes", "Trials", "Users", "SearchUsers"];
const getByParamsExclusionList = ["Confluence", "Capabilities", "Roles", "UserProfiles"];

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
