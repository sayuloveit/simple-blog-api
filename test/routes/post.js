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

describe('/posts routes', () => {

    let server;

    beforeEach(done => {
        require('../../src')((err, srv) => {
            server = srv;
            done();
        });
    });

    describe('POST /posts route', () => {

        it('should return the created post to an authenticated user', (done) => {
            const token = JWT.sign({ id: 1 }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "5s" });

            const testPost = {
                userId: 1,
                post: 'test post'
            };

            const options = {
                method: 'POST',
                url: '/posts',
                headers: {
                    authorization: token
                },
                payload: testPost
            };

            server.app.post = {
                create: (post) => {
                    return Promise.resolve(post);
                }
            };

            server.app.user = {
                findById: () => {
                    return Promise.resolve(true);
                }
            };

            server.inject(options, (res) => {
                const response = JSON.parse(res.payload);
                expect(res.statusCode).to.equal(201);
                expect(response).to.equal({ userId: testPost.userId, content: testPost.post });
                done();
            });
        });

        it('should reject a user trying to make a post for another user', (done) => {

            const token = JWT.sign({ id: 1 }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "5s" });

            const testPostPayload = {
                userId: 0,
                post: 'rejected post'
            };

            const options = {
                method: 'POST',
                url: '/posts',
                headers: {
                    authorization: token
                },
                payload: testPostPayload
            };

            server.app.post = {
                create: (post) => {
                    return Promise.resolve(post);
                }
            };

            server.app.user = {
                findById: () => {
                    return Promise.resolve(true);
                }
            };

            server.inject(options, (res) => {
                const { statusCode, message } = JSON.parse(res.payload);
                expect(statusCode).to.equal(401);
                expect(message).to.equal('user must make their own post');
                done();
            });
        });

        it('should prevent an unauthorized user from making a post', (done) => {
            const testPostPayload = {
                userId: 1,
                post: 'unauthorized post'
            };
            const options = {
                method: 'POST',
                url: '/posts',
                headers: {
                    authentication: 'not authenticated'
                },
                payload: testPostPayload
            };

            server.app.post = {
                create: (post) => {
                    return Promise.resolve(post);
                }
            };

            server.inject(options, (res) => {
                const { statusCode, message } = JSON.parse(res.payload);
                expect(statusCode).to.equal(401);
                expect(message).to.equal('Missing authentication');
                done();
            });
        });

        it('should return error message when unable to save post', (done) => {
            const token = JWT.sign({ id: 1 }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "5s" });

            const testPost = {
                userId: 1,
                post: 'bad post'
            };

            const options = {
                method: 'POST',
                url: '/posts',
                headers: {
                    authorization: token
                },
                payload: testPost
            };

            server.app.post = {
                create: (post) => {
                    return Promise.reject(post);
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
                expect(message).to.equal('unable to save post');
                done();
            });
        });

    });

    describe('PUT /posts/{postId} route', () => {

        it('should return the updated post to an authenticated user', (done) => {
             const token = JWT.sign({ id: 1 }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "1s" });

            const testPost = {
                post: 'test post'
            };

            const updatedTestPost = {
                userId: 1,
                content: 'updated post'
            };

            const options = {
                method: 'PUT',
                url: '/posts/1',
                headers: {
                    authorization: token
                },
                payload: testPost
            };

            server.app.user = {
                findById: () => {
                    return Promise.resolve(true);
                }
            };

            // mock post findOne
            server.app.post = {
                findOne: () => {
                    return Promise.resolve({
                        update: () => {
                            return Promise.resolve(updatedTestPost);
                        }
                    });
                }
            };

            server.inject(options, (res) => {
                const response = JSON.parse(res.payload);
                expect(res.statusCode).to.equal(200);
                expect(response).to.equal(updatedTestPost);
                done();
            });

        });

        it('should return error message when the post by the user is not found', (done) => {
             const token = JWT.sign({ id: 1 }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "1s" });

            const testPost = {
                post: 'test post'
            };

            const updatedTestPost = {
                userId: 1,
                content: 'updated post'
            };

            const options = {
                method: 'PUT',
                url: '/posts/1',
                headers: {
                    authorization: token
                },
                payload: testPost
            };

            server.app.post = {
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
                expect(message).to.equal('post by user not found');
                done();
            });

        });

        it('should return error message when there are issues retrieving post to update', (done) => {
             const token = JWT.sign({ id: 1 }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "1s" });

            const testPost = {
                post: 'test post'
            };

            const updatedTestPost = {
                userId: 1,
                content: 'updated post'
            };

            const options = {
                method: 'PUT',
                url: '/posts/1',
                headers: {
                    authorization: token
                },
                payload: testPost
            };

            server.app.post = {
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


        it('should return error message when unable to update a post', (done) => {
            const token = JWT.sign({ id: 1 }, Config.jwt.secret, { algorithm: Config.jwt.algo, expiresIn: "1s" });

            const testPost = {
                post: 'test post'
            };

            const options = {
                method: 'PUT',
                url: '/posts/1',
                headers: {
                    authorization: token
                },
                payload: testPost
            };

            // mock post findOne
            server.app.post = {
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
                expect(message).to.equal('unable to update post');
                done();
            });

        });

    });

    describe('GET /posts route', () => {
        const testPost = {
            id: 1,
            content: 'test post',
            userId: 1,
            postId: 1,
            createdAt: '2017-03-23 13:05:56.538',
            updatedAt: '2017-03-23 13:05:56.538'
        };

        const options = {
            method: 'GET',
            url: '/posts'
        };

        it('should return a list of posts', (done) => {
            server.app.post = {
                findAll: () => {
                    return Promise.resolve([testPost]);
                }
            };

            server.inject(options, (res) => {
                const response = JSON.parse(res.payload);
                expect(res.statusCode).to.equal(200);
                expect(response).to.contain(testPost);
                done();
            });
        });

        it('should return error message when unable to return posts', (done) => {
            server.app.post = {
                findAll: () => {
                    return Promise.reject();
                }
            };

            server.inject(options, (res) => {
                const { statusCode, message } = JSON.parse(res.payload);
                expect(statusCode).to.equal(502);
                expect(message).to.equal('unable to connect to database');
                done();
            });
        });
    });

});