'use strict';

const JWT = require('jsonwebtoken');
const Config = require('../config');

module.exports = function createJWTToken(userId) {
  return JWT.sign({ id: userId }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "1h" } );
}
