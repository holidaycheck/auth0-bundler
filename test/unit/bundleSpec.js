'use strict';

const { test } = require('ava');
const sinon = require('sinon');
const es2015ModulesCommonJSBabelPlugin = require('babel-plugin-transform-es2015-modules-commonjs');

const bundle = require('../../lib/bundle');
const buildDepdendencies = () => ({
    rollup: sinon.stub().resolves({ generate: sinon.stub().resolves({ code: '' }) }),
    babelTransform: sinon.stub().returns({ code: '' }),
    BabelPluginExportToFunction: sinon.stub(),
    buildLiteralAst: sinon.stub(),
    rollupCommonjs: sinon.stub()
});

test('bundle should call rollup correctly', (t) => {
    const dependencies = buildDepdendencies();

    dependencies.rollupCommonjs.returns('rollupPlugin');

    return bundle(dependencies, null, null, '/file/path.js').then(() => {
        t.true(dependencies.rollup.calledOnce);
        t.true(dependencies.rollup.calledWithMatch({
            entry: '/file/path.js',
            plugins: [ 'rollupPlugin' ]
        }));
    });
});

test('bundle should generate the rollup bundle', (t) => {
    const dependencies = buildDepdendencies();
    const rollupBundle = { generate: sinon.stub().resolves({ code: '' }) };

    dependencies.rollup.resolves(rollupBundle);

    return bundle(dependencies, null, null, '/file/path.js').then(() => {
        t.true(rollupBundle.generate.calledOnce);
        t.true(rollupBundle.generate.calledWith({ format: 'es' }));
    });
});

test('bundle should call babel with the correct preset and return the result', (t) => {
    const dependencies = buildDepdendencies();

    const bundleResult = 'bundleCode';
    const transpiledResult = 'function transpiledResult() {}';
    const expectedResult = 'function endResult() {}';
    const rollupBundle = { generate: sinon.stub().resolves({ code: bundleResult }) };

    dependencies.rollup.resolves(rollupBundle);
    dependencies.babelTransform.withArgs(bundleResult).returns({ code: transpiledResult });
    dependencies.babelTransform.withArgs(transpiledResult).returns({ code: expectedResult });
    dependencies.BabelPluginExportToFunction.returns({ internal: 'plugin' });

    return bundle(dependencies, null, null, '/file/path.js').then((result) => {
        t.true(dependencies.babelTransform.calledTwice);
        t.true(dependencies.babelTransform.calledWithMatch(bundleResult, {
            presets: [
                [ 'es2015' ]
            ],
            plugins: [
                [
                    es2015ModulesCommonJSBabelPlugin,
                    {
                        strict: true
                    }
                ]
            ]
        }));
        t.true(dependencies.babelTransform.calledWithMatch(transpiledResult, {
            plugins: [ { internal: 'plugin' } ]
        }));
        t.is(result, expectedResult);
    });
});

test('bundle should pass injecedOptions as ast to the export-to-function plugin', (t) => {
    const dependencies = buildDepdendencies();

    dependencies.buildLiteralAst.withArgs('myoptions').returns('myobjectliteral');

    return bundle(dependencies, { any: 'option' }, 'myoptions', '/file/path.js').then(() => {
        t.true(dependencies.BabelPluginExportToFunction.calledOnce);
        t.true(dependencies.BabelPluginExportToFunction.calledWithExactly('myobjectliteral', { any: 'option' }));
    });
});
