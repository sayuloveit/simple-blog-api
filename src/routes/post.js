'use strict';
const Joi = require('Joi');
const Boom = require('boom');

const verifyPostUser = require('../utils/verifyPostUser');

module.exports = [
    {
        method: 'POST',
        path: '/posts',
        config: {
            validate: {
                payload: {
                    userId: Joi.number().required(),
                    post: Joi.string().required()
                }
            },
            auth: {
                strategy: 'jwtToken'
            },
            description: 'allow authenticated users to create new posts'
        },
        handler: function (request, reply) {
            const { post, userId } = request.payload;

            if (request.auth.credentials.id === userId) {
                request.server.app.post.create({
                    content: post,
                    userId: userId
                })
                .then(newPost => {
                    reply(newPost).code(201);
                })
                .catch(error => {
                    reply(Boom.badData('unable to save post'));
                });
            } else {
                reply(Boom.unauthorized('user must make their own post'));
            };
        }
    },
    {
        method: 'PUT',
        path: '/posts/{postId}',
        config: {
            validate: {
                params: {
                    postId: Joi.number().required()
                },
                payload: {
                    post: Joi.string().required()
                }
            },
            auth: {
                strategy: 'jwtToken'
            },
            pre: [
                {
                    assign: 'post',
                    method: verifyPostUser
                }
            ],
            description: 'allow authenticated users to update their own posts'
        },
        handler: function (request, reply) {
            const { post } = request.payload;

            request.pre.post.update({
                content: post
            })
            .then(updatedPost => {
                reply(updatedPost);
            })
            .catch(error => {
                reply(Boom.badData('unable to update post'));
            });
        }
    },
    {
        method: 'GET',
        path: '/posts',
        config: {
            description: 'return all posts'
        },
        handler: function (request, reply) {
            request.server.app.post.findAll()
                .then(posts => {
                    reply(posts);
                })
                .catch(error => {
                    reply(Boom.badGateway('unable to connect to database'));
                });
        }
    }
];
