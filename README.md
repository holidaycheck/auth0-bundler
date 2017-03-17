# auth0-bundler

Bundle rules, scripts and hooks to deploy them to Auth0.

This allows for better abstraction and testability as you can use standard commonjs module
syntax in rules, scripts and hooks dedicated to be deployed to Auth0. When you bundle your
rule using `auth0-bundler`, you can use `require` statements to import other modules using
relative file paths. Additionally you can pass in a configuration at bundling time which
will be passed to your rule when it is executed.

## API

### auth0Bundler.bundleRule(injectedConfig, ruleFilename) -> Promise\<bundledRule\>

Bundles a rule to be deployed to Auth0. The rule needs to be written as a commonjs module that
exports a single function which takes 4 parameters: The config that can be specified at deploy
time and the standard Auth0 rule arguments.

__Example__:

Rule:

```ecmascript 6
// my-rule.js
// Example rule to be deployed to auth0

const doRequest = require('../common/function');

module.exports = function myRule(config, user, context, callback) {
    return doRequest(`${config.baseUrl}/some/endpoint`, user).then(function (result) {
        callback(result, context);
    });
};
```

Deployment:

```ecmascript 6
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
