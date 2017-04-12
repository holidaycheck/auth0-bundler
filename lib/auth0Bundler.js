'use strict';

const R = require('ramda');
const babelTransform = require('babel-core').transform;
const rollup = require('rollup').rollup;
const rollupCommonjs = require('rollup-plugin-commonjs');

const BabelPluginExportToFunction = require('./BabelPluginExportToFunction');
const bundleRule = require('./bundleScript');
const buildLiteralAst = require('./buildLiteralAst');

const dependencies = { rollup, babelTransform, BabelPluginExportToFunction, buildLiteralAst, rollupCommonjs };

module.exports = {
    bundleScript: R.partial(bundleRule, [ dependencies ]),
    bundleRule: R.partial(bundleRule, [ dependencies ])
};
