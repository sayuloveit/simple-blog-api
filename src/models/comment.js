'use strict';

const Sequelize = require('sequelize');
const sequelize = require('./db').sequelize;

const Comment = sequelize.define('comment', {
    content: Sequelize.STRING
});

module.exports = Comment;