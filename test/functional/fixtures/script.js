'use strict';

const { add } = require('./lib');

module.exports = function toBeTested(config, number, callback) {
    callback(null, add(number, config.value));
};
