// @ts-check
const region = process.env.AWSREGION || "eu-west-2";
const access = process.env.AWSPROFILE || "Dev";

const AWS = require("aws-sdk");
AWS.config.region = region;
const creds = new AWS.Credentials({
    accessKeyId: process.env.AWS_SECRETID,
    secretAccessKey: process.env.AWS_SECRETKEY,
});
AWS.config.credentials = creds;

module.exports.settings = {
    awsregion: region,
    awsenvironment: access,
    accessKeyId: process.env.AWS_SECRETID,
    secretAccessKey: process.env.AWS_SECRETKEY,
    AWS,
};

module.exports.AWS = AWS;
