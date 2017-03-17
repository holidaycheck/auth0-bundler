const R = require('ramda');
const babelTransform = require('babel-core').transform;
const rollup = require('rollup').rollup;
const rollupCommonjs = require('rollup-plugin-commonjs');

const { BabelPluginExportToFunction } = require('./BabelPluginExportToFunction');
const bundleRule = require('./bundleRule');
const buildLiteralAst = require('./buildLiteralAst');

const dependencies = { rollup, babelTransform, BabelPluginExportToFunction, buildLiteralAst, rollupCommonjs };

module.exports = { bundleRule: R.partial(bundleRule, [ dependencies ]) };
