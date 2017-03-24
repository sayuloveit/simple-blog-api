'use strict';

const Sequelize = require('sequelize');
const sequelize = require('./db').sequelize;

const Post = sequelize.define('post', {
    content: Sequelize.STRING
});

module.exports = Post;