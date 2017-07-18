'use strict';

const { add } = require('./lib');

function toBeTested(config, number, callback) {
    callback(null, add(number, config.value));
}

module.exports = toBeTested;
