'use strict';
const Boom = require('boom');

module.exports = function validateUserToken(decodedToken, request, callback) {
    request.server.app.user.findById(decodedToken.id)
        .then(user => {
            if (user) {
                return callback(null, true);
            } else {
                return callback(null, false);
            }
        })
        .catch(error => {
            return callback(null, false);
        });
}
