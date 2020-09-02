'use strict';

const R = require('ramda');
const babelTransform = require('@babel/core').transform;
const rollup = require('rollup').rollup;
const rollupCommonjs = require('rollup-plugin-commonjs');

const BabelPluginExportToFunction = require('./BabelPluginExportToFunction');
const bundle = require('./bundle');
const buildLiteralAst = require('./buildLiteralAst');

const dependencies = { rollup, babelTransform, BabelPluginExportToFunction, buildLiteralAst, rollupCommonjs };

const nodeVersionsSupportedByAuth0 = [ 8, 12 ];

const defaultNodeVersion = nodeVersionsSupportedByAuth0[0];

module.exports = function createBundler({ nodeVersion = defaultNodeVersion } = {}) {
    if (!nodeVersionsSupportedByAuth0.includes(nodeVersion)) {
        const message = `Unsupported node version ${nodeVersion}, ` +
            `only one of the following versions are supported: ${nodeVersionsSupportedByAuth0.join(', ')}`;

        throw new Error(message);
    }

    return {
        bundleScript: R.partial(bundle, [ dependencies, { commonjs: false, nodeVersion } ]),
        bundleRule: R.partial(bundle, [ dependencies, { commonjs: false, nodeVersion } ]),
        bundleHook: R.partial(bundle, [ dependencies, { commonjs: true, nodeVersion } ])
    };
};

// kept for backwards compatibility
module.exports.bundleScript = R.partial(bundle, [ dependencies, { commonjs: false, nodeVersion: defaultNodeVersion } ]);
module.exports.bundleRule = R.partial(bundle, [ dependencies, { commonjs: false, nodeVersion: defaultNodeVersion } ]);
module.exports.bundleHook = R.partial(bundle, [ dependencies, { commonjs: true, nodeVersion: defaultNodeVersion } ]);
