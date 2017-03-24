'use strict';
const Joi = require('Joi');
const Boom = require('boom');

const createJWTToken = require('../utils/createJWTToken');
const checkUserUniq = require('../utils/checkUserUniq');

module.exports = [
    {
        method: 'POST',
        path: '/signup',
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
                    method: checkUserUniq
                }
            ],
            description: 'create new users and assign a jwt token'
        },
        handler: function (request, reply) {

            request.server.app.bcrypt.hash(request.payload.password, 10)
                .then(hashedPassword => {
                    return request.server.app.user.create({
                        username: request.payload.username,
                        password: hashedPassword
                    })
                })
                .then(user => {
                    // issue a token for the newly created user
                    const token = createJWTToken(user.get('id'), user.get('username'));
                    reply({ token: token }).code(201);
                })
                .catch(error => {
                    reply(Boom.badGateway('unable to save user'));
                })

        }
    }
];
