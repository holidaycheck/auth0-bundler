'use strict';

const R = require('ramda');
const { add, subtract } = require('./lib');

module.exports = function hook(config, user, context, callback) {
    const mergedUser = R.merge(user, {
        addConfigValueToMe: add(user.addConfigValueToMe, config.value),
        addOneToMe: add(user.addOneToMe, 1),
        subtract42FromMe: subtract(user.subtract42FromMe, 42)
    });

    callback(null, mergedUser, context);
};
