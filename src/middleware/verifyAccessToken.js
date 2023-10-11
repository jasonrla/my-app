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
        req.user = user;
        next();
    });
};

module.exports = verifyAccessToken;
