'use strict';

/* eslint-disable no-use-before-define */

const R = require('ramda');
const types = require('babel-types');

const nullary = R.nAry(0);

const buildLiteral = R.cond([
    [ R.is(Number), types.numericLiteral ],
    [ R.is(String), types.stringLiteral ],
    [ R.is(Boolean), types.booleanLiteral ],
    [ R.is(RegExp), (re) => types.regExpLiteral(re.source, re.flags) ],
    [ R.is(Array), buildArrayLiteral ],
    [ R.is(Object), buildObjectLiteral ],
    [ R.T, nullary(types.nullLiteral) ]
]);

function buildArrayLiteral(arr) {
    return types.arrayExpression(R.map(buildLiteral, arr));
}

// Please note that we only support simple non-circular javascript constructs
function buildObjectLiteral(obj) {
    const entries = R.toPairs(obj);
    const properties = R.map(function ([ key, value ]) {
        const keyLiteral = types.stringLiteral(key);
        const valueLiteral = buildLiteral(value);

        return types.objectProperty(keyLiteral, valueLiteral);
    }, entries);

    return types.objectExpression(properties);
}

module.exports = buildLiteral;
