'use strict';

const Boom = require('Boom');
const JWT = require('jsonwebtoken');
const Config = require('../config');

module.exports = function verifyPostUser(request, reply) {
    const decodedToken = JWT.verify(request.auth.artifacts, Config.jwt.secret);

    request.server.app.post.findOne({
        where: {
            id: request.params.postId,
            userId: decodedToken.id
        }
    })
    .then(post => {
        if (post) {
            reply(post);
        } else {
            reply(Boom.notFound('post by user not found'));
        }
    })
    .catch(error => {
        reply(Boom.badGateway('unable to connect to db'));
    });

}