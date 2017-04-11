const R = require('ramda');
const babelTemplate = require('babel-template');

const WRAPPER_ID = '__bundlerWrapper';
const CALLBACK_ID = '__bundlerCallback';
const CONFIG_ID = '__bundlerConfig';
const buildArgumentIdentifier = (id) => `__bundlerArg${id + 1}`;
const buildRuleWrapper = babelTemplate(`function ${WRAPPER_ID}(FUNCTION_IDENTIFIERS) {
  'use strict';

  var ${CONFIG_ID} = CONFIG
  BODY
}`);
const isDefaultExport = R.allPass([
    R.propEq('type', 'MemberExpression'),
    R.pathEq([ 'object', 'name' ], 'exports'),
    R.pathEq([ 'property', 'name' ], 'default')
]);
const isValidFunctionExpression = R.allPass([
    R.propEq('type', 'FunctionExpression'),
    R.pipe(R.prop('params'), R.length, R.gte(R.__, 2))
]);
const isIdentifier = R.propEq('type', 'Identifier');
const getIdentifierNames = (functionDefinition) => R.pipe(
    R.map(buildArgumentIdentifier),
    R.append(CALLBACK_ID)
)(R.range(0, functionDefinition.params.length - 2));

function BabelPluginExportToFunction(configAst) {
    return ({ types }) => ({
        visitor: {
            AssignmentExpression(path) {
                const left = path.node.left;
                const right = path.node.right;

                if (isDefaultExport(left) && isIdentifier(right)) {
                    const functionIdentifier = path.node.right;
                    const binding = path.scope.bindings[functionIdentifier.name];

                    if (binding && isValidFunctionExpression(binding.path.node.init)) {
                        const functionDefinition = binding.path.node.init;

                        this.hasDefaultExport = true;
                        this.identifierNamesForScript = getIdentifierNames(functionDefinition);

                        path.replaceWith(
                            types.callExpression(
                                functionIdentifier,
                                R.map(
                                    types.identifier,
                                    R.prepend(CONFIG_ID, this.identifierNamesForScript)
                                )
                            )
                        );
                    }
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
                            FUNCTION_IDENTIFIERS: R.map(types.identifier, this.identifierNamesForScript),
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

module.exports = BabelPluginExportToFunction;
