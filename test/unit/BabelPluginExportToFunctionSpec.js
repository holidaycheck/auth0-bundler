'use strict';

const test = require('ava').test;
const babel = require('babel-core');
const babelTypes = require('babel-types');

const BabelPluginExportToFunction = require('../../lib/BabelPluginExportToFunction');

test('BabelPluginExportToFunction should wrap a function without arguments', (t) => {
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

test('BabelPluginExportToFunction should wrap a function expression with multiple arguments', (t) => {
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

    t.is(error.message, 'unknown: auth0-bundler is missing default export in module');
});

test('BabelPluginExportToFunction should throw on variable export', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.stringLiteral('testconfig'));
    const code = 'const a = "test"; exports.default = a;';
    const error = t.throws(() => babel.transform(code, { plugins: [ exportToFunction ] }));

    t.is(error.message, 'unknown: auth0-bundler is missing default export in module');
});

test('BabelPluginExportToFunction should throw on not enough arguments', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.nullLiteral());
    const code = [
        'var rule = function myRule(config) {}',
        'exports.default = rule;'
    ].join('\n');

    const error = t.throws(() => babel.transform(code, { plugins: [ exportToFunction ] }));

    t.is(error.message, 'unknown: auth0-bundler is missing default export in module');
});

test('BabelPluginExportToFunction should throw on a missing export', (t) => {
    const exportToFunction = new BabelPluginExportToFunction(babelTypes.stringLiteral('testconfig'));
    const code = 'function myRule() {}';
    const error = t.throws(() => babel.transform(code, { plugins: [ exportToFunction ] }), TypeError);

    t.is(error.message, 'unknown: auth0-bundler is missing default export in module');
});
