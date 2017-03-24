'use strict';
const Joi = require('Joi');
const Boom = require('boom');

const verifyPostComment = require('../utils/verifyPostComment');

module.exports = [
    {
        method: 'POST',
        path: '/posts/{postId}/comments',
        config: {
            validate: {
                params: {
                    postId: Joi.number().required()
                },
                payload: {
                    userId: Joi.number().optional(),
                    comment: Joi.string().required()
                }
            },
            description: 'allow authenticated and non authenticated users to comment on posts',
        },
        handler: function (request, reply) {
            const { comment, userId } = request.payload;

            request.server.app.comment.create({
                content: comment,
                userId: userId || 0, // 0 for anonymous users
                postId: request.params.postId
            })
            .then(newComment => {
                reply(newComment).code(201);
            })
            .catch(error => {
                reply(Boom.badData('unable to save comment'));
            });
        }
    },
    {
        method: 'PUT',
        path: '/posts/{postId}/comments/{commentId}',
        config: {
            validate: {
                params: {
                    postId: Joi.number().required(),
                    commentId: Joi.number().required()
                },
                payload: {
                    comment: Joi.string().required()
                }
            },
            auth: {
                strategy: 'jwtToken'
            },
            pre: [
                {
                    assign: 'comment',
                    method: verifyPostComment
                }
            ],
            description: 'allow authenticated users to edit their own comments',
        },
        handler: function (request, reply) {
            const { comment } = request.payload;

            request.pre.comment.update({
                content: comment
            })
            .then(updatedcomment => {
                reply(updatedcomment);
            })
            .catch(error => {
                reply(Boom.badData('unable to update comment'));
            });
        }
    },
    {
        method: 'GET',
        path: '/posts/{postId}/comments',
        config: {
            validate: {
                params: {
                    postId: Joi.number().required()
                }
            },
            description: 'get all comments for a post',
        },
        handler: function (request, reply) {
            request.server.app.comment.findAll({
                where: {
                    postId: request.params.postId
                }
            })
            .then(comments => {
                if (comments) {
                    reply(comments);
                } else {
                    reply(Boom.notFound('no post associated with comments'));
                }
            })
            .catch(error => {
                reply(Boom.badGateway('issue connecting to database'));
            });
        }
    }
];
