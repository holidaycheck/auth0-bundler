# auth0-bundler

[![NPM version][npm-image]][npm-url]
[![Build status][travis-ci-image]][travis-ci-url]
[![License][license-image]][license-url]

Bundle rules, scripts and hooks to deploy them to Auth0.

This allows for better abstraction and testability as you can use standard commonjs module
syntax in rules, scripts and hooks dedicated to be deployed to Auth0. When you bundle your
rule using `auth0-bundler`, you can use `require` statements to import other modules using
relative file paths. Additionally you can pass in a configuration at bundling time which
will be passed to your rule when it is executed.

## API

### auth0Bundler.bundleScript(injectedConfig, ruleFilename) -> Promise\<bundledScript\>
### auth0Bundler.bundleRule(injectedConfig, ruleFilename) -> Promise\<bundledRule\>

Bundles scripts and/or rules to be deployed to Auth0. The rule needs to be written as a commonjs
module that exports a single function which takes 4 parameters: The config that can be specified
at deploy time and the standard Auth0 rule arguments. Modules required from the `node_modules`
folder will not be bundled and will be required in the Auth0 environment as well.

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
        callback(R.merge({ some: 'result' }, result), context);
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

This is an example on how to use auth0-bundler and the auth0 management client to automatically
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

## Changelog

There have not been any releases yet. See the [CHANGELOG.md](CHANGELOG.md) file for more info once a version
was released.

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

[npm-image]: https://img.shields.io/npm/v/auth0-bundler.svg?style=flat-square
[npm-url]: https://npmjs.org/package/auth0-bundler
[travis-ci-image]: https://img.shields.io/travis/holidaycheck/auth0-bundler/master.svg?style=flat-square
[travis-ci-url]: https://travis-ci.org/holidaycheck/auth0-bundler
[license-image]: http://img.shields.io/npm/l/auth0-lock.svg?style=flat-square
[license-url]: #license
