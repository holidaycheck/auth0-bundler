'use strict';

const R = require('ramda');
const babelTransform = require('@babel/core').transform;
const rollup = require('rollup').rollup;
const rollupCommonjs = require('rollup-plugin-commonjs');

const BabelPluginExportToFunction = require('./BabelPluginExportToFunction');
const bundle = require('./bundle');
const buildLiteralAst = require('./buildLiteralAst');

const dependencies = { rollup, babelTransform, BabelPluginExportToFunction, buildLiteralAst, rollupCommonjs };

module.exports = {
    bundleScript: R.partial(bundle, [ dependencies, { commonjs: false } ]),
    bundleRule: R.partial(bundle, [ dependencies, { commonjs: false } ]),
    bundleHook: R.partial(bundle, [ dependencies, { commonjs: true } ])
};
