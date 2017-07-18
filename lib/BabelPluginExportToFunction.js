'use strict';

const R = require('ramda');
const babelTemplate = require('babel-template');

const WRAPPER_ID = '__bundlerWrapper';
const CALLBACK_ID = '__bundlerCallback';
const CONFIG_ID = '__bundlerConfig';
const EXPORT_ERROR = 'auth0-bundler could not resolve a function with at least 2 parameters as default export.';
const buildArgumentIdentifier = (id) => `__bundlerArg${id + 1}`;
const buildFunctionWrapper = babelTemplate(`function ${WRAPPER_ID}(FUNCTION_IDENTIFIERS) {
  'use strict';

  var ${CONFIG_ID} = CONFIG
  BODY
}`);
const buildModuleWrapper = babelTemplate(`module.exports = function ${WRAPPER_ID}(FUNCTION_IDENTIFIERS) {
    'use strict';

    var ${CONFIG_ID} = CONFIG
    BODY
};`);
const isDefaultExport = R.allPass([
    R.propEq('type', 'MemberExpression'),
    R.pathEq([ 'object', 'name' ], 'exports'),
    R.pathEq([ 'property', 'name' ], 'default')
]);
const hasMoreThanTwoParameters = R.pathSatisfies(R.gte(R.__, 2), [ 'params', 'length' ]);
const isValidFunctionExpression = R.allPass([
    R.propEq('type', 'FunctionExpression'),
    hasMoreThanTwoParameters
]);
const isValidFunctionDeclaration = R.allPass([
    R.propEq('type', 'FunctionDeclaration'),
    hasMoreThanTwoParameters
]);
const isIdentifier = R.propEq('type', 'Identifier');
const getIdentifierNames = (functionDefinition) => R.pipe(
    R.map(buildArgumentIdentifier),
    R.append(CALLBACK_ID)
)(R.range(0, functionDefinition.params.length - 2));
const recursivelyResolveBinding = R.curry((bindings, identifier) => {
    const resolved = bindings[identifier.name];
    const INIT_PROPERTY = 'init';

    return R.ifElse(
        R.pipe(R.propOr({}, INIT_PROPERTY), isIdentifier),
        R.pipe(R.prop(INIT_PROPERTY), recursivelyResolveBinding(bindings)),
        R.identity
    )(resolved.path.node);
});

function BabelPluginExportToFunction(configAst, options = { commonjs: false }) {
    return ({ types }) => ({
        visitor: {
            AssignmentExpression(path) {
                const left = path.node.left;
                const right = path.node.right;

                if (isDefaultExport(left) && isIdentifier(right)) {
                    const functionIdentifier = path.node.right;
                    const node = recursivelyResolveBinding(path.scope.bindings, functionIdentifier);
                    const functionDefinition = R.cond([
                        [ isValidFunctionDeclaration, R.identity ],
                        [ R.pipe(R.propOr({}, 'init'), isValidFunctionExpression), R.prop('init') ],
                        [ R.T, R.always(null) ]
                    ])(node);

                    if (functionDefinition) {
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
                            throw new TypeError(EXPORT_ERROR);
                        }

                        const wrapMethod = options.commonjs ? buildModuleWrapper : buildFunctionWrapper;

                        const wrapped = wrapMethod({
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
