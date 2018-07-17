'use strict';

const test = require('ava');
const createBundler = require('../../lib/auth0Bundler');

test('throws when an unsupported node version is provided', (t) => {
    const expectedMessage = 'Unsupported node version 6, only one of the following versions are supported: 4, 8';

    t.throws(() => {
        createBundler({ nodeVersion: 6 });
    }, expectedMessage);
});

