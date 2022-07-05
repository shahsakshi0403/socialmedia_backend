const { verifyJwtToken } = require('./jwt');

// to check user is authenticate or not
const authenticateToken = (continueWithNotAuthenticated = false) => {
    return async (req, res, next) => {
        let payload;
        token = req.headers['authorization'];
        //console.log('Token:',token);
        if (token) {
            payload = await verifyJwtToken(token);
            if (payload) {
                //console.log('Payload:', payload);
                req.userId = payload.id;
                next();
                return;
            }
        }
        if (continueWithNotAuthenticated) {
            next();
        }
        else {
            res.status(500).json({ status: "Invalid Token" });
        }
    }
}

module.exports = { authenticateToken }