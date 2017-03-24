'use strict';

const Sequelize = require('sequelize');

module.exports = {
    sequelize: new Sequelize('main', null, null, {
        host: 'localhost',
        dialect: "sqlite",
        storage: __dirname + '/../../blog.db',
        omitNull: true
    })
};
