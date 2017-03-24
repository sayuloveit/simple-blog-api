'use strict';
const Boom = require('boom');
const Bcrypt = require('bcrypt');

module.exports = function checkUserPassword(request, reply) {
    request.server.app.user.findOne({
        attributes: ['id', 'username', 'password'],
        where: {
            username: request.payload.username
        }
    })
    .then(user => {
        if (user) {
            request.server.app.bcrypt.compare(request.payload.password, user.get('password'))
                .then(isValid => {
                    if (isValid) {
                        reply(user);
                    } else {
                        reply(Boom.badRequest('incorrect password for username'));
                    }
                })
                .catch(error => {
                    reply(Boom.badRequest('invalid password'));
                });

        } else {
            reply(Boom.notFound('username not found'));
        }
    })
    .catch(error => {
        reply(Boom.badGateway('unable to connect to database'));
    });
}