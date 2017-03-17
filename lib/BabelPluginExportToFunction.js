const R = require('ramda');
const babelTemplate = require('babel-template');

const WRAPPER_ID = 'auth0BundlerWrapper';
const USER_ID = 'auth0BundlerUser';
const CONTEXT_ID = 'auth0BundlerContext';
const CALLBACK_ID = 'auth0BundlerCallback';
const CONFIG_ID = 'auth0BundlerConfig';
const buildRuleWrapper = babelTemplate(`function ${WRAPPER_ID}(${USER_ID}, ${CONTEXT_ID}, ${CALLBACK_ID}) {
  'use strict';

  var ${CONFIG_ID} = CONFIG
  BODY
}`);
const isDefaultExport = R.allPass([
    R.propEq('type', 'MemberExpression'),
    R.pathEq([ 'object', 'name' ], 'exports'),
    R.pathEq([ 'property', 'name' ], 'default')
]);
const isIdentifier = R.propEq('type', 'Identifier');

function BabelPluginExportToFunction(configAst) {
    return ({ types }) => ({
        visitor: {
            AssignmentExpression(path) {
                const left = path.node.left;
                const right = path.node.right;

                if (isDefaultExport(left) && isIdentifier(right)) {
                    const functionIdentifier = path.node.right;

                    this.hasDefaultExport = true;

                    path.replaceWith(
                        types.callExpression(
                            functionIdentifier,
                            [
                                types.identifier(CONFIG_ID),
                                types.identifier(USER_ID),
                                types.identifier(CONTEXT_ID),
                                types.identifier(CALLBACK_ID)
                            ]
                        )
                    );
                }
            },
            Program: {
                exit(path) {
                    if (!this.isWrapped) {
                        if (!this.hasDefaultExport) {
                            throw new TypeError('auth0-bundler is missing default export in module');
                        }

                        const wrapped = buildRuleWrapper({
                            CONFIG: configAst,
                            BODY: path.node.body
                        });

                        path.replaceWith(types.program([ wrapped ]));

                        this.isWrapped = true;
                    }
                }
            }
        }
    });
}

module.exports = { BabelPluginExportToFunction };
