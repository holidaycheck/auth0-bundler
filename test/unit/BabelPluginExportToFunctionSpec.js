const test = require('ava').test;
const babel = require('babel-core');
const babelTypes = require('babel-types');

const { BabelPluginExportToFunction } = require('../../lib/BabelPluginExportToFunction');

test('BabelPluginExportToFunction should wrap the function', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.nullLiteral());
    const code = [
        'var rule = function myRule() {}',
        'exports.default = rule;'
    ].join('\n');
    const expected = [
        'function auth0BundlerWrapper(auth0BundlerUser, auth0BundlerContext, auth0BundlerCallback) {',
        '  \'use strict\';',
        '',
        '  var auth0BundlerConfig = null;',
        '  var rule = function myRule() {};',
        '  rule(auth0BundlerConfig, auth0BundlerUser, auth0BundlerContext, auth0BundlerCallback);',
        '}'
    ].join('\n');

    t.is(babel.transform(code, {
        plugins: [ exportToFunction ]
    }).code, expected);
});

test('BabelPluginExportToFunction should inject config ast', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.stringLiteral('testconfig'));
    const code = [
        'var rule = function myRule() {}',
        'exports.default = rule;'
    ].join('\n');
    const expected = [
        'function auth0BundlerWrapper(auth0BundlerUser, auth0BundlerContext, auth0BundlerCallback) {',
        '  \'use strict\';',
        '',
        '  var auth0BundlerConfig = "testconfig";',
        '  var rule = function myRule() {};',
        '  rule(auth0BundlerConfig, auth0BundlerUser, auth0BundlerContext, auth0BundlerCallback);',
        '}'
    ].join('\n');

    t.is(babel.transform(code, {
        plugins: [ exportToFunction ]
    }).code, expected);
});

test('BabelPluginExportToFunction should throw on invalid export', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.stringLiteral('testconfig'));
    const code = 'function myRule() { exports.default = function (test) {}; }';
    t.throws(() => babel.transform(code, { plugins: [ exportToFunction ] }));
});

test('BabelPluginExportToFunction should throw on a missing export', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.stringLiteral('testconfig'));
    const code = 'function myRule() {}';
    const error = t.throws(() => babel.transform(code, { plugins: [ exportToFunction ] }), TypeError);

    t.is(error.message, 'unknown: auth0-bundler is missing default export in module');
});
