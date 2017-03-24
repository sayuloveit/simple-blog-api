'use strict';

const User = require('./user');
const Post = require('./post');
const Comment = require('./comment');

// associations
User.hasMany(Post);
Post.hasOne(User);

User.hasMany(Comment);
Post.hasMany(Comment);
Comment.belongsTo(User);
Comment.belongsTo(Post);

module.exports = {
    user: User,
    post: Post,
    comment: Comment
}