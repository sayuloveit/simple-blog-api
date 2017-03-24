'user strict';

const Code = require('code');
const Lab = require('lab');
const Promise = require('bluebird');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.test;
const before = lab.before;

describe('POST /signup route', () => {
    let server;

    before(done => {
        require('../../src')((err, srv) => {
            server = srv;
            done();
        });
    });

    it('should create a user and provide a token', (done) => {
        const user = {
            username: 'vic',
            password: 'test'
        };

        const options = {
            method: 'POST',
            url: '/signup',
            payload: user
        };

        server.app.user = {
            findOne: () => {
                return Promise.resolve();
            },
            create: (user) => {
                return Promise.resolve({
                    get: (key) => {
                        return key === 'id' ? 1 : 'vic';
                    }
                });
            }
        };

        server.app.bcrypt = {
            hash: () => {
                return Promise.resolve('hashedPassword');
            }
        };

        server.inject(options, (res) => {
            const { token } = JSON.parse(res.payload);
            expect(token).to.be.a.string();
            done();
        });
    });

    it('should return error when username is already taken', (done) => {
        const user = {
            username: 'vic',
            password: 'test'
        };

        const options = {
            method: 'POST',
            url: '/signup',
            payload: user
        };

        server.app.user = {
            findOne: () => {
                return Promise.resolve(user);
            }
        };

        server.inject(options, (res) => {
            const { statusCode, message } = JSON.parse(res.payload);
            expect(statusCode).to.equal(400);
            expect(message).to.equal('username taken');
            done();
        });
    });

    it('should return error when unable to check if username is already taken', (done) => {
        const user = {
            username: 'vic',
            password: 'test'
        };

        const options = {
            method: 'POST',
            url: '/signup',
            payload: user
        };

        server.app.user = {
            findOne: () => {
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

    it('should return error when unable to save a new user', (done) => {
        const user = {
            username: 'vic',
            password: 'test'
        };

        const options = {
            method: 'POST',
            url: '/signup',
            payload: user
        };

        server.app.user = {
            findOne: () => {
                return Promise.resolve();
            },
            create: (user) => {
                return Promise.reject();
            }
        };

        server.app.bcrypt = {
            hash: () => {
                return Promise.resolve('hashedPassword');
            }
        };

        server.inject(options, (res) => {
            const { statusCode, message } = JSON.parse(res.payload);
            expect(statusCode).to.equal(502);
            expect(message).to.equal('unable to save user');
            done();
        });
    });


});
