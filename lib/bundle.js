'use strict';

const babelPresetEnv = require('@babel/preset-env');
const es2015ModulesCommonJSBabelPlugin = require('@babel/plugin-transform-modules-commonjs');

function isExternalModule(moduleId) {
    return !moduleId.startsWith('.');
}

module.exports = function bundleRule(dependencies, options, injectedConfig, ruleFilename) {
    const { rollup, babelTransform, BabelPluginExportToFunction, buildLiteralAst, rollupCommonjs } = dependencies;

    return Promise.resolve(rollup({
        input: ruleFilename,
        plugins: options.plugins([ rollupCommonjs({ ignore: isExternalModule }) ])
    })).then((bundle) => {
        const optionsAst = buildLiteralAst(injectedConfig);
        return bundle.generate({ format: 'es' }).then(({ output: [ { code } ] }) => {
            const packagedFunction = babelTransform(code, {
                presets: [
                    [ babelPresetEnv, {
                        targets: {
                            node: options.nodeVersion
                        }
                    } ]
                ],
                plugins: [
                    [
                        es2015ModulesCommonJSBabelPlugin,
                        {
                            strict: true
                        }
                    ]
                ]
            }).code;

            return babelTransform(packagedFunction, {
                plugins: [ new BabelPluginExportToFunction(optionsAst, options) ]
            }).code;
        });
    });
};
