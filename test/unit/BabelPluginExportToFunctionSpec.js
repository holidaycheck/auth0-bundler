'use strict';

const test = require('ava').test;
const babel = require('babel-core');
const babelTypes = require('babel-types');

const BabelPluginExportToFunction = require('../../lib/BabelPluginExportToFunction');
const expectedErrorMessage =
    'unknown: auth0-bundler could not resolve a function with at least 2 parameters as default export.';

test('BabelPluginExportToFunction should wrap a function without any additional parameters', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.nullLiteral());
    const code = [
        'var rule = function myRule(config, callback) {}',
        'exports.default = rule;'
    ].join('\n');
    const expected = [
        'function __bundlerWrapper(__bundlerCallback) {',
        '  \'use strict\';',
        '',
        '  var __bundlerConfig = null;',
        '  var rule = function myRule(config, callback) {};',
        '  rule(__bundlerConfig, __bundlerCallback);',
        '}'
    ].join('\n');

    t.is(babel.transform(code, {
        plugins: [ exportToFunction ]
    }).code, expected);
});

test('BabelPluginExportToFunction should wrap a function expression with addititonal parameters', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.nullLiteral());
    const code = [
        'var rule = function myRule(config, myArg1, myArg2, callback) {}',
        'exports.default = rule;'
    ].join('\n');
    const expected = [
        'function __bundlerWrapper(__bundlerArg1, __bundlerArg2, __bundlerCallback) {',
        '  \'use strict\';',
        '',
        '  var __bundlerConfig = null;',
        '  var rule = function myRule(config, myArg1, myArg2, callback) {};',
        '  rule(__bundlerConfig, __bundlerArg1, __bundlerArg2, __bundlerCallback);',
        '}'
    ].join('\n');

    t.is(babel.transform(code, {
        plugins: [ exportToFunction ]
    }).code, expected);
});

test('BabelPluginExportToFunction should wrap a function and assign it to module.exports', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.nullLiteral(), { commonjs: true });
    const code = [
        'var rule = function myRule(config, callback) {}',
        'exports.default = rule;'
    ].join('\n');
    const expected = [
        'module.exports = function __bundlerWrapper(__bundlerCallback) {',
        '  \'use strict\';',
        '',
        '  var __bundlerConfig = null;',
        '  var rule = function myRule(config, callback) {};',
        '  rule(__bundlerConfig, __bundlerCallback);',
        '};'
    ].join('\n');

    t.is(babel.transform(code, {
        plugins: [ exportToFunction ]
    }).code, expected);
});

test('BabelPluginExportToFunction should use `const` instead of `var` when nodeVersion >= 8', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.nullLiteral(), { nodeVersion: 8 });
    const code = [
        'const rule = function myRule(config, myArg1, myArg2, callback) {}',
        'exports.default = rule;'
    ].join('\n');
    const expected = [
        'function __bundlerWrapper(__bundlerArg1, __bundlerArg2, __bundlerCallback) {',
        '  \'use strict\';',
        '',
        '  const __bundlerConfig = null;',
        '  const rule = function myRule(config, myArg1, myArg2, callback) {};',
        '  rule(__bundlerConfig, __bundlerArg1, __bundlerArg2, __bundlerCallback);',
        '}'
    ].join('\n');

    t.is(babel.transform(code, {
        plugins: [ exportToFunction ]
    }).code, expected);
});

test('BabelPluginExportToFunction should wrap a function declaration', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.nullLiteral());
    const code = [
        'function myRule(config, arg1, callback) {}',
        'var script = myRule;',
        'exports.default = script;'
    ].join('\n');
    const expected = [
        'function __bundlerWrapper(__bundlerArg1, __bundlerCallback) {',
        '  \'use strict\';',
        '',
        '  var __bundlerConfig = null;',
        '  function myRule(config, arg1, callback) {}',
        '  var script = myRule;',
        '  script(__bundlerConfig, __bundlerArg1, __bundlerCallback);',
        '}'
    ].join('\n');

    t.is(babel.transform(code, {
        plugins: [ exportToFunction ]
    }).code, expected);
});

test('BabelPluginExportToFunction should inject config ast', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.stringLiteral('testconfig'));
    const code = [
        'var rule = function myRule(config, callback) {}',
        'exports.default = rule;'
    ].join('\n');
    const expected = [
        'function __bundlerWrapper(__bundlerCallback) {',
        '  \'use strict\';',
        '',
        '  var __bundlerConfig = "testconfig";',
        '  var rule = function myRule(config, callback) {};',
        '  rule(__bundlerConfig, __bundlerCallback);',
        '}'
    ].join('\n');

    t.is(babel.transform(code, {
        plugins: [ exportToFunction ]
    }).code, expected);
});

test('BabelPluginExportToFunction should throw on invalid export', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.stringLiteral('testconfig'));
    const code = 'function myRule() { exports.default = function (test) {}; }';
    const error = t.throws(() => babel.transform(code, { plugins: [ exportToFunction ] }));

    t.is(error.message, expectedErrorMessage);
});

test('BabelPluginExportToFunction should throw on variable export', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.stringLiteral('testconfig'));
    const code = 'const a = "test"; exports.default = a;';
    const error = t.throws(() => babel.transform(code, { plugins: [ exportToFunction ] }));

    t.is(error.message, expectedErrorMessage);
});

test('BabelPluginExportToFunction should throw when there are not at least 2 parameters', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.nullLiteral());
    const code = [
        'var rule = function myRule(config) {}',
        'exports.default = rule;'
    ].join('\n');

    const error = t.throws(() => babel.transform(code, { plugins: [ exportToFunction ] }));

    t.is(error.message, expectedErrorMessage);
});

test('BabelPluginExportToFunction should throw on a missing export', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.stringLiteral('testconfig'));
    const code = 'function myRule() {}';
    const error = t.throws(() => babel.transform(code, { plugins: [ exportToFunction ] }), TypeError);

    t.is(error.message, expectedErrorMessage);
});
