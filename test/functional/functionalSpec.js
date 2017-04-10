const ava = require('ava');
const path = require('path');

const { bundleRule } = require('../../lib/auth0Bundler');

ava.test('it should build a rule that can be evaled (evil!)', (t) => {
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

ava.test('it should build a script that can be evaled (evil!)', (t) => {
    const scriptPath = path.join(__dirname, 'fixtures/script.js');

    return bundleRule({ value: 10 }, scriptPath).then((result) => {
        const scriptToTest = eval(`(${result})`); // eslint-disable-line no-eval

        scriptToTest(10, (error, numberPlusConfig) => {
            t.is(error, null);
            t.is(numberPlusConfig, 20);
        });
    });
});

