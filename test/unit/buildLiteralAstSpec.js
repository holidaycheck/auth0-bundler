'use strict';

const test = require('ava').test;
const R = require('ramda');
const babelTypes = require('babel-types');

const buildLiteralAst = require('../../lib/buildLiteralAst');

const testSingleProperty = (t, obj, expectedOptions, expectedType) => {
    const [ key ] = R.keys(obj);
    const ast = buildLiteralAst(obj);

    babelTypes.assertObjectExpression(ast);

    t.is(ast.properties.length, 1);
    babelTypes.assertStringLiteral(ast.properties[0].key, { value: key });
    babelTypes[`assert${expectedType}Literal`](ast.properties[0].value, expectedOptions);

    t.pass();
};

test('buildLiteral should return a string object correctly', (t) => {
    const ast = buildLiteralAst('test');

    babelTypes.assertStringLiteral(ast, { value: 'test' });

    t.pass();
});

test('buildLiteral should return an empty object literal for an empty object', (t) => {
    const ast = buildLiteralAst({});

    babelTypes.assertObjectExpression(ast);
    t.is(ast.properties.length, 0);
    t.pass();
});

test(
    'buildLiteral should return an object literal with string as property',
    testSingleProperty,
    { foo: 'bar' },
    { value: 'bar' },
    'String'
);

test(
    'buildLiteral should return an object literal with number as property',
    testSingleProperty,
    { bar: 1 },
    { value: 1 },
    'Numeric'
);

test(
    'buildLiteral should return an object literal with null as property',
    testSingleProperty,
    { baz: null },
    undefined,
    'Null'
);

test(
    'buildLiteral should return an object literal with a regexp as property',
    testSingleProperty,
    { baz: /myregex/g },
    { pattern: 'myregex', flags: 'g' },
    'RegExp'
);

test('buildLiteral should work with multiple properties', (t) => {
    const ast = buildLiteralAst({
        foo: 'bar',
        baz: 1
    });

    t.is(ast.properties.length, 2);
    babelTypes.assertStringLiteral(ast.properties[0].key, { value: 'foo' });
    babelTypes.assertStringLiteral(ast.properties[0].value, { value: 'bar' });
    babelTypes.assertStringLiteral(ast.properties[1].key, { value: 'baz' });
    babelTypes.assertNumericLiteral(ast.properties[1].value, { value: 1 });

    t.pass();
});

test('buildLiteral should work with array properties', (t) => {
    const ast = buildLiteralAst({
        foo: [ 'bar', 1 ]
    });

    babelTypes.assertStringLiteral(ast.properties[0].key, { value: 'foo' });
    babelTypes.assertArrayExpression(ast.properties[0].value);

    t.is(ast.properties[0].value.elements.length, 2);
    babelTypes.assertStringLiteral(ast.properties[0].value.elements[0], { value: 'bar' });
    babelTypes.assertNumericLiteral(ast.properties[0].value.elements[1], { value: 1 });

    t.pass();
});

test('buildLiteral should work with nested properties', (t) => {
    const ast = buildLiteralAst({
        foo: { bar: 'baz' },
        test: 'value'
    });

    const firstNestedObject = ast.properties[0].value;
    babelTypes.assertStringLiteral(ast.properties[0].key, { value: 'foo' });
    babelTypes.assertObjectExpression(firstNestedObject);

    const nestedString = firstNestedObject.properties[0].value;
    babelTypes.assertStringLiteral(firstNestedObject.properties[0].key, { value: 'bar' });
    babelTypes.assertStringLiteral(nestedString, { value: 'baz' });

    babelTypes.assertStringLiteral(ast.properties[1].key, { value: 'test' });
    babelTypes.assertStringLiteral(ast.properties[1].value, { value: 'value' });

    t.pass();
});
