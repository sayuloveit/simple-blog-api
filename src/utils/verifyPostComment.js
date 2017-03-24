'use strict';

const Boom = require('Boom');
const JWT = require('jsonwebtoken');
const Config = require('../config');

module.exports = function verifyPostComment(request, reply) {
    const decodedToken = JWT.verify(request.auth.artifacts, Config.jwt.secret);

    request.server.app.comment.findOne({
        where: {
            id: request.params.commentId,
            userId: decodedToken.id,
            postId: request.params.postId
        }
    })
    .then(comment => {
        if (comment) {
            reply(comment);
        } else {
            reply(Boom.notFound('comment by user for post not found'));
        }
    })
    .catch(error => {
        reply(Boom.badGateway('unable to connect to db'));
    });

}