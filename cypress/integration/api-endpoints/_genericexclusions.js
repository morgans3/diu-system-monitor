const deletionExclusionList = ["Cohorts", "CVICohorts", "TeamRequests", "Teams"];
const putExclusionList = ["Cohorts", "CVICohorts", "Password", "TeamMembers", "TeamRequests", "Teams"];
const postExclusionList = [
    "Demographics",
    "Docobo",
    "TeamMembers",
    "MFA",
    "ServiceAccounts",
    "GPInpatients",
    "GovUKNotify",
    "NICEEvidenceSearch",
];
const exclusionList = ["Demographics", "Docobo", "DocoboOutbound", "MFA", "PostCodes", "Trials", "Users", "SearchUsers"];

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

module.exports.Exclusions = {
    isInExclusionList,
    isInDeletionExclusionList,
    isInPutExclusionList,
    isInPOSTExclusionList,
};
