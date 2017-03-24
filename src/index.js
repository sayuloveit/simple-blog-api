'use strict';

const Hapi = require('hapi');
const JWTAuth = require('hapi-auth-jwt2');
const Vision = require('vision');
const Inert = require('inert');
const Lout = require('lout');
const Glob = require('glob');
const Bcrypt = require('bcrypt');

const config = require('./config');
const models = require('./models');
const validateUserToken = require('./utils/validateUserToken');

// export server for tests
module.exports = function (callback) {
    const server = new Hapi.Server();

    server.connection({
        host: config.host,
        port: config.port
    });

    // make available in route handlers using this.
    server.bind({
        config: config
    });

    // store references in server
    // for easier access and testing
    server.app.user = models.user;
    server.app.post = models.post;
    server.app.comment = models.comment;
    server.app.bcrypt = Bcrypt;

    // register plugins and routes
    server.register([JWTAuth, Vision, Inert, Lout], (error) => {

        if (error) {
            console.error(error);
        }

        server.auth.strategy('jwtToken', 'jwt', {
            key: config.jwt.secret,
            verifyOptions: {
                algorithms: [config.jwt.algo]
            },
            validateFunc: validateUserToken
        });

        // register routes
        Glob.sync('/routes/*.js', {
            root: __dirname
        }).forEach(file => {
            // console.log('loading route from: ', file);
            const route = require(file);
            server.route(route);
        });

    });

    callback(null, server);
}

