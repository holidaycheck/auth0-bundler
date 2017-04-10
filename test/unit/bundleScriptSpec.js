const { test } = require('ava');
const sinon = require('sinon');

const bundleScript = require('../../lib/bundleScript');
const buildDepdendencies = () => ({
    rollup: sinon.stub().resolves({ generate: sinon.stub().returns({ code: '' }) }),
    babelTransform: sinon.stub().returns({ code: '' }),
    BabelPluginExportToFunction: sinon.stub(),
    buildLiteralAst: sinon.stub(),
    rollupCommonjs: sinon.stub()
});

test('bundleScript should call rollup correctly', (t) => {
    const dependencies = buildDepdendencies();

    dependencies.rollupCommonjs.returns('rollupPlugin');

    return bundleScript(dependencies, null, '/rule/path.js').then(() => {
        t.true(dependencies.rollup.calledOnce);
        t.true(dependencies.rollup.calledWithMatch({
            entry: '/rule/path.js',
            plugins: [ 'rollupPlugin' ]
        }));
    });
});

test('bundleScript should generate the rollup bundle', (t) => {
    const dependencies = buildDepdendencies();
    const bundle = { generate: sinon.stub().returns({ code: '' }) };

    dependencies.rollup.resolves(bundle);

    return bundleScript(dependencies, null, '/rule/path.js').then(() => {
        t.true(bundle.generate.calledOnce);
        t.true(bundle.generate.calledWith({ format: 'es' }));
    });
});

test('bundleScript should call babel with the correct preset and return the result', (t) => {
    const dependencies = buildDepdendencies();

    const bundleResult = 'bundleCode';
    const transpiledResult = 'function transpiledResult() {}';
    const expectedResult = 'function endResult() {}';
    const bundle = { generate: sinon.stub().returns({ code: bundleResult }) };

    dependencies.rollup.resolves(bundle);
    dependencies.babelTransform.withArgs(bundleResult).returns({ code: transpiledResult });
    dependencies.babelTransform.withArgs(transpiledResult).returns({ code: expectedResult });
    dependencies.BabelPluginExportToFunction.returns({ internal: 'plugin' });

    return bundleScript(dependencies, null, '/rule/path.js').then((result) => {
        t.true(dependencies.babelTransform.calledTwice);
        t.true(dependencies.babelTransform.calledWithMatch(bundleResult, {
            presets: [
                [ 'es2015' ]
            ]
        }));
        t.true(dependencies.babelTransform.calledWithMatch(transpiledResult, {
            plugins: [ { internal: 'plugin' } ]
        }));
        t.is(result, expectedResult);
    });
});

test('bundleScript should pass injecedOptions as ast to the export-to-function plugin', (t) => {
    const dependencies = buildDepdendencies();

    dependencies.buildLiteralAst.withArgs('myoptions').returns('myobjectliteral');

    return bundleScript(dependencies, 'myoptions', '/rule/path.js').then(() => {
        t.true(dependencies.BabelPluginExportToFunction.calledOnce);
        t.true(dependencies.BabelPluginExportToFunction.calledWith('myobjectliteral'));
    });
});
