'use strict';

const R = require('ramda');
const babelTransform = require('@babel/core').transform;
const rollup = require('rollup').rollup;
const rollupCommonjs = require('rollup-plugin-commonjs');

const BabelPluginExportToFunction = require('./BabelPluginExportToFunction');
const bundle = require('./bundle');
const buildLiteralAst = require('./buildLiteralAst');

const dependencies = { rollup, babelTransform, BabelPluginExportToFunction, buildLiteralAst, rollupCommonjs };

const defaultNodeVersion = 4;

module.exports = function createBundler({ nodeVersion = defaultNodeVersion } = {}) {
    const parseNodeVersion = parseInt(nodeVersion, 10);

    return {
        bundleScript: R.partial(bundle, [ dependencies, { commonjs: false, nodeVersion: parseNodeVersion } ]),
        bundleRule: R.partial(bundle, [ dependencies, { commonjs: false, nodeVersion: parseNodeVersion } ]),
        bundleHook: R.partial(bundle, [ dependencies, { commonjs: true, nodeVersion: parseNodeVersion } ])
    };
};

// kept for backwards compatibility
module.exports.bundleScript = R.partial(bundle, [ dependencies, { commonjs: false, nodeVersion: defaultNodeVersion } ]);
module.exports.bundleRule = R.partial(bundle, [ dependencies, { commonjs: false, nodeVersion: defaultNodeVersion } ]);
module.exports.bundleHook = R.partial(bundle, [ dependencies, { commonjs: true, nodeVersion: defaultNodeVersion } ]);
