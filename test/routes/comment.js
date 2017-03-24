'user strict';

const Code = require('code');
const Lab = require('lab');
const Promise = require('bluebird');
const JWT = require('jsonwebtoken');

const Config = require('../../src/config');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.test;
const beforeEach = lab.beforeEach;

describe('/comments routes', () => {

    let server;

    beforeEach(done => {
        require('../../src')((err, srv) => {
            server = srv;
            done();
        });
    });

    describe('POST /posts/{postId}/comments route', () => {

        it('should return the created comment to belonging to the provided user and post id', (done) => {

            const testComment = {
                userId: 1,
                comment: 'test comment'
            };

            const options = {
                method: 'POST',
                url: '/posts/1/comments',
                payload: testComment
            };

            server.app.comment = {
                create: (post) => {
                    return Promise.resolve(post);
                }
            };

            server.inject(options, (res) => {
                const response = JSON.parse(res.payload);
                expect(res.statusCode).to.equal(201);
                expect(response).to.equal({ userId: testComment.userId, content: testComment.comment, postId: 1 });
                done();
            });
        });

        it('should return the created comment to belonging to provided post id and unknown user', (done) => {

            const testComment = {
                comment: 'test comment'
            };

            const options = {
                method: 'POST',
                url: '/posts/1/comments',
                payload: testComment
            };

            server.app.comment = {
                create: (post) => {
                    return Promise.resolve(post);
                }
            };

            server.inject(options, (res) => {
                const response = JSON.parse(res.payload);
                expect(res.statusCode).to.equal(201);
                expect(response).to.equal({ userId: 0, content: testComment.comment, postId: 1 });
                done();
            });
        });

        it('should return error message when unable to save comment', (done) => {
            const testComment = {
                comment: 'test comment'
            };

            const options = {
                method: 'POST',
                url: '/posts/1/comments',
                payload: testComment
            };

            server.app.comment = {
                create: () => {
                    return Promise.reject();
                }
            };

            server.inject(options, (res) => {
                const response = JSON.parse(res.payload);
                expect(response).to.be.an.object().and.contain(['statusCode', 'error', 'message']);
                expect(response.statusCode).to.equal(422);
                expect(response.message).to.equal('unable to save comment');
                done();
            });
        });

    });

    describe('PUT /posts/{postId}/comments/{commentId} route', () => {

        it('should return the updated comment to an authenticated and authorized user', (done) => {
            const token = JWT.sign({ id: 1 }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "1s" });

            const testComment = {
                comment: 'test comment'
            };

            const unpdatedTestComment = {
                userId: 1,
                postId: 1,
                comment: 'updated comment'
            };

            const options = {
                method: 'PUT',
                url: '/posts/1/comments/1',
                headers: {
                    authorization: token
                },
                payload: testComment
            };

            // mock comment findOne
            server.app.comment = {
                findOne: () => {
                    return Promise.resolve({
                        update: () => {
                            return Promise.resolve(unpdatedTestComment);
                        }
                    });
                }
            };

            server.app.user = {
                findById: () => {
                    return Promise.resolve(true);
                }
            };

            server.inject(options, (res) => {
                const response = JSON.parse(res.payload);
                expect(res.statusCode).to.equal(200);
                expect(response).to.equal(unpdatedTestComment);
                done();
            });

        });

        it('should return error message when an authenticated and authorized user is unable to update their comment', (done) => {
           const token = JWT.sign({ id: 1 }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "1s" });

            const testComment = {
                comment: 'test comment'
            };

            const unpdatedTestComment = {
                userId: 1,
                postId: 1,
                comment: 'updated comment'
            };

            const options = {
                method: 'PUT',
                url: '/posts/1/comments/1',
                headers: {
                    authorization: token
                },
                payload: testComment
            };

            // mock comment findOne
            server.app.comment = {
                findOne: () => {
                    return Promise.resolve({
                        update: () => {
                            return Promise.reject();
                        }
                    });
                }
            };

             server.app.user = {
                findById: () => {
                    return Promise.resolve(true);
                }
            };

            server.inject(options, (res) => {
                const { statusCode, message } = JSON.parse(res.payload);
                expect(statusCode).to.equal(422);
                expect(message).to.equal('unable to update comment');
                done();
            });

        });

        it('should return error message when the post comment by the user is not found', (done) => {
             const token = JWT.sign({ id: 1 }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "1s" });

            const testComment = {
                comment: 'test comment'
            };

            const options = {
                method: 'PUT',
                url: '/posts/1/comments/1',
                headers: {
                    authorization: token
                },
                payload: testComment
            };

            server.app.comment = {
                findOne: () => {
                    return Promise.resolve();
                }
            };

            server.app.user = {
                findById: () => {
                    return Promise.resolve(true);
                }
            };

            server.inject(options, (res) => {
                const { statusCode, message } = JSON.parse(res.payload);
                expect(statusCode).to.equal(404);
                expect(message).to.equal('comment by user for post not found');
                done();
            });

        });

        it('should return error message when there are issues retrieving comment to update', (done) => {
             const token = JWT.sign({ id: 1 }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "1s" });

            const testComment = {
                comment: 'test comment'
            };

            const options = {
                method: 'PUT',
                url: '/posts/1/comments/1',
                headers: {
                    authorization: token
                },
                payload: testComment
            };

            server.app.comment = {
                findOne: () => {
                    return Promise.reject();
                }
            };

             server.app.user = {
                findById: () => {
                    return Promise.resolve(true);
                }
            };

            server.inject(options, (res) => {
                const { statusCode, message } = JSON.parse(res.payload);
                expect(statusCode).to.equal(502);
                expect(message).to.equal('unable to connect to db');
                done();
            });

        });

    });

    describe('GET /posts/{postId}/comments route', () => {
        const testComment = {
            id: 1,
            content: 'test comment',
            userId: 1,
            postId: 1,
            createdAt: '2017-03-23 13:05:56.538',
            updatedAt: '2017-03-23 13:05:56.538'
        };

        const options = {
            method: 'GET',
            url: '/posts/1/comments'
        };

        it('should return a list of comments for the post', (done) => {
            server.app.comment = {
                findAll: () => {
                    return Promise.resolve([testComment]);
                }
            };

            server.inject(options, (res) => {
                const response = JSON.parse(res.payload);
                expect(res.statusCode).to.equal(200);
                expect(response).to.contain(testComment);
                done();
            });
        });

        it('should return error message when unable to return post comments', (done) => {
            server.app.comment = {
                findAll: () => {
                    return Promise.reject();
                }
            };

            server.inject(options, (res) => {
                const { statusCode, message } = JSON.parse(res.payload);
                expect(statusCode).to.equal(502);
                expect(message).to.equal('issue connecting to database');
                done();
            });
        });

        it('should return message when no comments are found for the post', (done) => {
            server.app.comment = {
                findAll: () => {
                    return Promise.resolve(null);
                }
            };

            server.inject(options, (res) => {
                const { statusCode, message } = JSON.parse(res.payload);
                expect(statusCode).to.equal(404);
                expect(message).to.equal('no post associated with comments');
                done();
            });
        });

    });

});