# auth0-bundler

[![NPM version][npm-image]][npm-url]
[![Build status][travis-ci-image]][travis-ci-url]
[![License][license-image]][license-url]

Bundle [rules](https://auth0.com/docs/rules), [scripts](https://auth0.com/docs/connections/database/mysql#3-provide-action-scripts) and [hooks](https://auth0.com/docs/hooks) to deploy them to Auth0.

This allows you to
- test rules, scripts and hooks dedicated to be deployed to Auth0, as they can be required in node as well.
- import other modules by using `require` statements with relative file paths. This way common functionality can be shared between rules.
- write your rules using the whole ES2015 feature set, as the rules will be transpiled at bundle time.
- pass in configuration at bundling time which can be used in your rule when it is executed.

## API

### auth0Bundler.bundleScript(injectedConfig, scriptFilename) -> Promise\<bundledScript\>
### auth0Bundler.bundleRule(injectedConfig, ruleFilename) -> Promise\<bundledRule\>
### auth0Bundler.bundleHook(injectedConfig, hookFilename) -> Promise\<bundledHook\>

Bundles a single script, rule or hook so it can be deployed to Auth0. The rule needs to be written as a commonjs
module that exports a single function. This function takes an additional first parameter compared to being defined in Auth0: The `injectedConfig` that can be specified at bundle time. Modules required from the `node_modules` folder will not be bundled and will be required in the Auth0 environment as well. Auth0 provides a number of modules inside the Auth0 environment, to check whether a module can be required check [webtaskio-canirequire](https://tehsis.github.io/webtaskio-canirequire/).

__Example__:

Rule:

```js
// my-rule.js
// Example rule to be deployed to auth0

// This dependency will be automatically bundled into the rule
const doRequest = require('../common/function');
// This dependency will be loaded using require
const R = require('ramda');

module.exports = function myRule(config, user, context, callback) {
    return doRequest(`${config.baseUrl}/some/endpoint`, user).then(function (result) {
        callback(null, R.merge({ some: 'result' }, result), context);
    });
};
```

Bundle dependencies:

```js
const auth0Bundler = require('auth0-bundler');
const config = { baseUrl: 'https://www.example.com' };

auth0Bundler
    .bundleRule(config, `${__dirname}/my-rule.js`)
    .then(console.log);
```



## Using auth0-bundler during deployment

This is an example on how to use auth0-bundler and the Auth0 Management API client to automatically
deploy a rule using auth0-bundler. Like this you can automatically deploy rules e.g. during a
CI run.

```js
const ManagementClient = require('auth0').ManagementClient;
const management = new ManagementClient({
  token: '{YOUR_API_V2_TOKEN}',
  domain: '{YOUR_ACCOUNT}.auth0.com'
});
const auth0Bundler = require('auth0-bundler');
const config = { baseUrl: 'https://www.example.com' };

auth0Bundler.bundleRule(config, `${__dirname}/my-rule.js`).then((bundledRule) => {
    return management.createRule({
        enabled: true,
        name: 'my-rule',
        order: 1,
        stage: 'login_success',
        script: bundledRule
    });
});
```

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

[npm-image]: https://img.shields.io/npm/v/auth0-bundler.svg
[npm-url]: https://npmjs.org/package/auth0-bundler
[travis-ci-image]: https://img.shields.io/travis/holidaycheck/auth0-bundler/master.svg
[travis-ci-url]: https://travis-ci.org/holidaycheck/auth0-bundler
[license-image]: http://img.shields.io/npm/l/auth0-lock.svg
[license-url]: #license
