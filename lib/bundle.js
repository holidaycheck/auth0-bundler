'use strict';

function isExternalModule(moduleId) {
    return !moduleId.startsWith('.');
}

module.exports = function bundleRule(dependencies, options, injectedConfig, ruleFilename) {
    const { rollup, babelTransform, BabelPluginExportToFunction, buildLiteralAst, rollupCommonjs } = dependencies;

    return Promise.resolve(rollup({
        entry: ruleFilename,
        plugins: [ rollupCommonjs({ ignore: isExternalModule }) ]
    })).then((bundle) => {
        const optionsAst = buildLiteralAst(injectedConfig);
        const bundleCode = bundle.generate({ format: 'es' }).code;
        const packagedFunction = babelTransform(bundleCode, {
            presets: [
                [ 'es2015' ]
            ],
            plugins: [
                [
                    'transform-es2015-modules-commonjs',
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
};
