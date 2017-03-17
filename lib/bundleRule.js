module.exports = function bundleRule(dependencies, injectedConfig, ruleFilename) {
    const { rollup, babelTransform, BabelPluginExportToFunction, buildLiteralAst, rollupCommonjs } = dependencies;

    return Promise.resolve(rollup({
        entry: ruleFilename,
        plugins: [ rollupCommonjs() ]
    })).then((bundle) => {
        const optionsAst = buildLiteralAst(injectedConfig);
        const bundleCode = bundle.generate({ format: 'es' }).code;
        const packagedFunction = babelTransform(bundleCode, {
            presets: [
                [ 'es2015' ]
            ]
        }).code;

        return babelTransform(packagedFunction, {
            plugins: [ new BabelPluginExportToFunction(optionsAst) ]
        }).code;
    });
};
