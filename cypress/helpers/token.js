const JWT = require("jsonwebtoken");

module.exports.decodeToken = (token) => {
    return JWT.decode(token.replace("JWT ", ""));
};
