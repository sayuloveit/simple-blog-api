const Code = require('code');
const Lab = require('lab');
const Promise = require('bluebird');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.test;
const before = lab.before;

const JWT = require('jsonwebtoken');
const Config = require('../../src/config');

const createJWTToken = require('../../src/utils/createJWTToken');

describe('createJWTToken', () => {
    it('create a token from user id', (done) => {
        const token = createJWTToken(9000);
        const decodedToken = JWT.verify(token, Config.jwt.secret);

        expect(decodedToken.id).to.equal(9000);
        expect(decodedToken.exp - decodedToken.iat).to.equal(3600); // 1 hour token session
        done();
    });
});
