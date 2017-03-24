'use strict';
const Boom = require('boom');

module.exports = function checkUserUniq(request, reply) {
    request.server.app.user.findOne({
        attributes: ['username'],
        where: {
            username: request.payload.username
        }
    })
    .then(user => {
        if (user) {
            reply(Boom.badRequest('username taken'));
        } else {
            reply(request.payload);
        }
    })
    .catch(error => {
        reply(Boom.badGateway('unable to connect to database'));
    });
}
