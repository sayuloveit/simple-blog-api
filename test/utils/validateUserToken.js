const Code = require('code');
const Lab = require('lab');
const Promise = require('bluebird');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.test;
const before = lab.before;

const Config = require('../../src/config');

const validateUserToken = require('../../src/utils/validateUserToken');

describe('validateUserToken', () => {

    it('should a true value in callback when user exists', (done) => {

        const request = {
            server: {
                app: {
                    user: {
                        findById: () => {
                            return Promise.resolve(true);
                        }
                    }
                }
            }
        };

        validateUserToken({id: 1}, request, function(error, isValid) {
            expect(error).to.be.null();
            expect(isValid).to.be.true();
            done();
        })
    });

    it('should a false value in callback when user does not exist', (done) => {

        const request = {
            server: {
                app: {
                    user: {
                        findById: () => {
                            return Promise.resolve(false);
                        }
                    }
                }
            }
        };

        validateUserToken({id: 1}, request, (error, isValid) => {
            expect(error).to.be.null();
            expect(isValid).to.be.false();
            done();
        })
    });

     it('should a false value in callback when there are issues looking for user', (done) => {

        const request = {
            server: {
                app: {
                    user: {
                        findById: () => {
                            return Promise.reject();
                        }
                    }
                }
            }
        };

        validateUserToken({id: 1}, request, (error, isValid) => {
            expect(error).to.be.null();
            expect(isValid).to.be.false();
            done();
        })
    });

});
