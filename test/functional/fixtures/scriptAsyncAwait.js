'use strict';

/* eslint-disable node/no-unsupported-features */

async function foo() {
    await 'something';
}

function toBeTested(config, number, callback) {
    foo().then(() => callback()).catch(() => {});
}

module.exports = toBeTested;
