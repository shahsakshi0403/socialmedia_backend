const jwt = require('jsonwebtoken');

const jwtKey = process.env.jwtKey;
const EXPIRY_TIME = process.env.EXPIRY_TIME;

//generate token
async function generateJwtToken(id) {
    token = await jwt.sign({ id }, jwtKey, { expiresIn: EXPIRY_TIME });
    return token;
}

//verify token
async function verifyJwtToken(token) {
    try {
        const result = await jwt.verify(token, jwtKey);
        return result;
    }
    catch (err) {
        return null;
    }
}

module.exports = { generateJwtToken, verifyJwtToken };