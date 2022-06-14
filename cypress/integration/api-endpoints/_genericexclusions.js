const manualTestList = [
    "Capabilities",
    "Cohorts",
    "CVICohorts",
    "Demographics",
    "Docobo",
    "DocoboOutbound",
    "GovUKNotify",
    "GPInpatients",
    "HouseholdIsochrone",
    "MFA",
    "NICEEvidenceSearch",
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
];

const isInExclusionList = (tag) => {
    return manualTestList.includes(tag);
};

module.exports.Exclusions = {
    isInExclusionList,
};
