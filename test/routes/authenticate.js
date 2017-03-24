'user strict';

const Code = require('code');
const Lab = require('lab');
const Promise = require('bluebird');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.test;
const beforeEach = lab.beforeEach;

describe('POST /auth route', () => {
    let server;

    beforeEach(done => {
        require('../../src')((err, srv) => {
            server = srv;
            done();
        });
    });

    it('should authenticate a user and provide a token', (done) => {
        const user = {
            username: 'vic',
            password: 'test'
        };

        const options = {
            method: 'POST',
            url: '/authenticate',
            payload: user
        };

        server.app.user = {
            findOne: () => {
                return Promise.resolve({
                    get: (key) => {
                        return key === 'id' ? 1 : 'test';
                    }
                });
            }
        };

        server.app.bcrypt = {
            compare: () => {
                return Promise.resolve(true);
            }
        };

        server.inject(options, (res) => {
            const { token } = JSON.parse(res.payload);
            expect(token).to.be.a.string();
            done();
        });
    });

    it('should tell when a username is not found and provide a 404 code and message', (done) => {
        const user = {
            username: 'waldo',
            password: 'notfound'
        };

        const options = {
            method: 'POST',
            url: '/authenticate',
            payload: user
        };

         server.app.user = {
            findOne: () => {
                return Promise.resolve(false);
            }
        };

        server.app.bcrypt = {
            compare: () => {
                return Promise.resolve(true);
            }
        };

        server.inject(options, (res) => {
            const { statusCode, message } = JSON.parse(res.payload);
            expect(statusCode).to.equal(404);
            expect(message).to.equal('username not found');
            done();
        });

    });

    it('should tell when a user password is incorrect and provide a 400 code and message', (done) => {
        const user = {
            username: 'vic',
            password: 'wrong pass'
        };

        const options = {
            method: 'POST',
            url: '/authenticate',
            payload: user
        };

        server.app.user = {
            findOne: () => {
                return Promise.resolve({
                    get: (key) => {
                        return key === 'id' ? 1 : 'test';
                    }
                });
            }
        };

        server.app.bcrypt = {
            compare: () => {
                return Promise.resolve(false);
            }
        };

        server.inject(options, (res) => {
            const { statusCode, message } = JSON.parse(res.payload);
            expect(statusCode).to.equal(400);
            expect(message).to.equal('incorrect password for username');
            done();
        });

    });

    it('should tell when a user password is invalid and provide a 400 code and message', (done) => {

        const user = {
            username: 'vic',
            password: 'invalid pass'
        };

        const options = {
            method: 'POST',
            url: '/authenticate',
            payload: user
        };

        server.app.user = {
            findOne: () => {
                return Promise.resolve({
                    get: (key) => {
                        return key === 'id' ? 1 : 'test';
                    }
                });
            }
        };

        server.app.bcrypt = {
            compare: () => {
                return Promise.reject();
            }
        };

        server.inject(options, (res) => {
            const { statusCode, message } = JSON.parse(res.payload);
            expect(statusCode).to.equal(400);
            expect(message).to.equal('invalid password');
            done();
        });

    });

    it('should tell when the database is not accessible and provide a 502 code and message', (done) => {
        // mock user
        server.app.user = {
            findOne: () => {
                return Promise.reject();
            }
        };

        const user = {
            username: 'vic',
            password: 'test'
        };

        const options = {
            method: 'POST',
            url: '/authenticate',
            payload: user
        };

        server.inject(options, (res) => {
            const { statusCode, message } = JSON.parse(res.payload);
            expect(statusCode).to.equal(502);
            expect(message).to.equal('unable to connect to database');
            done();
        });

    });

});
