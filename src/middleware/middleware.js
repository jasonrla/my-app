const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const gvars = require('../utils/const.js');

const poolData = {
    UserPoolId: process.env.UserPoolId,
    ClientId: process.env.ClientId
};

const region = process.env.region;
const userPoolId = poolData['UserPoolId'];

const client = jwksClient({
    jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
});


function getKey(header, callback){
    client.getSigningKey(header.kid, function(err, key) {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

const verifyAccessToken = (req, res, next) => {
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
    
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, user) => {
        if (err) {
            return res.sendStatus(401);
        }
        //req.user = user;
        const userRole = user['cognito:groups'] ? user['cognito:groups'][0] : null;
        req.user = { ...user, role: userRole };
        gvars.role = userRole;
        next();
    });
};

function checkRole(...allowedRoles) {

    return (req, res, next) => {
        const userRole = req.user.role;
        if (!userRole) {
            return res.status(403).json({"error": "No tiene un rol asignado."});
        }
        if (allowedRoles.includes(userRole)) {
            return next();
        } else {
            return res.status(403).json({"error": "No tiene permiso para acceder a este recurso."});
        }
    };
}

module.exports = {
    verifyAccessToken, 
    checkRole
};
