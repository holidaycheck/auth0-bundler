'use strict';

const test = require('ava');
const path = require('path');
const sinon = require('sinon');
const Bluebird = require('bluebird');
const R = require('ramda');
const { NodeVM } = require('vm2');

const { bundleRule, bundleScript, bundleHook } = require('../../lib/auth0Bundler');

test('builds a rule that can be evaled (evil!)', (t) => {
    const rulePath = path.join(__dirname, 'fixtures/rule.js');

    return bundleRule({ value: 10 }, rulePath).then((result) => {
        const user = { addOneToMe: 1, subtract42FromMe: 42, addConfigValueToMe: 10 };
        const context = { my: 'context' };
        const ruleToTest = eval(`(${result})`); // eslint-disable-line no-eval

        ruleToTest(user, context, (error, resultingUser, resultingContext) => {
            t.is(error, null);
            t.deepEqual(resultingUser, { addOneToMe: 2, subtract42FromMe: 0, addConfigValueToMe: 20 });
            t.is(resultingContext, context);
        });
    });
});

test('builds a script that can be evaled (evil!)', (t) => {
    const scriptPath = path.join(__dirname, 'fixtures/script.js');

    return bundleScript({ value: 10 }, scriptPath).then((result) => {
        const scriptToTest = eval(`(${result})`); // eslint-disable-line no-eval

        scriptToTest(10, (error, numberPlusConfig) => {
            t.is(error, null);
            t.is(numberPlusConfig, 20);
        });
    });
});

test('doesn’t log warnings to the console', (t) => {
    /* eslint-disable no-console */
    sinon.stub(console, 'error');

    t.plan(1);

    const rulePath = path.join(__dirname, 'fixtures/rule.js');

    return Bluebird.resolve(bundleRule({}, rulePath))
        .then(() => {
            t.is(console.error.callCount, 0);
        })
        .finally(() => {
            console.error.restore();
        });
});

test('bundles hooks correctly as a commonjs module', (t) => {
    const hookPath = path.join(__dirname, 'fixtures/hook.js');

    t.plan(4);

    return bundleHook({ value: 20 }, hookPath)
        .then((bundledHook) => {
            const vm = new NodeVM({
                console: 'inherit',
                sandbox: {},
                require: {
                    external: true,
                    root: './'
                }
            });

            const exportedValue = vm.run(bundledHook, hookPath);

            t.true(R.is(Function, exportedValue));

            const user = { addConfigValueToMe: 30, addOneToMe: 41, subtract42FromMe: 0, foo: 'bar' };

            exportedValue(user, {}, (error, resultingUser, resultingContext) => {
                t.is(error, null);

                t.deepEqual(resultingUser, {
                    foo: 'bar',
                    addConfigValueToMe: 50,
                    addOneToMe: 42,
                    subtract42FromMe: -42
                });
                t.deepEqual(resultingContext, {});
            });
        });
});
