const AWSHelper = require("../classes/aws");

Cypress.Commands.add("getAccounts", async () => {
    try {
        const userData = {
            userData: {},
            adminUserData: {},
        };
        const userAccounts = JSON.parse(await AWSHelper.getSecrets("cypressaccounts"));
        // non admin user
        userData.userData.username = userAccounts.username;
        userData.userData.password = userAccounts.password;
        userData.userData.organisation = "Collaborative Partners";
        userData.userData.authentication = "Demo";
        // admin user
        userData.adminUserData.username = userAccounts.admin_username;
        userData.adminUserData.password = userAccounts.admin_password;
        userData.adminUserData.organisation = "Collaborative Partners";
        userData.adminUserData.authentication = "Demo";
        return userData;
    } catch (error) {
        console.error(error);
    }
});
