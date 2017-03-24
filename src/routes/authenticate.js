'use strict';
const Joi = require('Joi');
const Boom = require('boom');

const createJWTToken = require('../utils/createJWTToken');
const checkUserPassword = require('../utils/checkUserPassword');

module.exports = [
    {
        method: 'POST',
        path: '/authenticate',
        config: {
            validate: {
                payload: {
                    username: Joi.string().required(),
                    password: Joi.string().required()
                }
            },
            pre: [
                {
                    assign: 'user',
                    method: checkUserPassword
                }
            ],
            description: 'authenticate user credentials and assign a jwt token.'
        },
        handler: function (request, reply) {
            const user = request.pre.user;
            const token = createJWTToken(user.get('id'), user.get('username'));
            reply({token: token}).code(201);
        }
    }
];
