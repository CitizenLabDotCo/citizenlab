/**
 * @fileoverview Rule to disallow unnecessary semicolons
 * @author Nicholas C. Zakas
 */


//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: "disallow unnecessary semicolons",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: "code",
    schema: [], // no options
  },
  create: (context) => {
    return {
      ImportDeclaration: (node) => {
        const moduleName = node.source.value;

        if (moduleName === 'react-intl') {
          context.getDeclaredVariables(node).forEach((variable) => {
            if (variable.name === 'FormattedMessage') {
              context.report({
                node,
                message: 'No FormattedMessage from \'react-intl\', use \'utils/cl-intl\' instead',
              });
            } else if (variable.name === 'injectIntl') {
              context.report({
                node,
                message: 'No injectIntl from \'react-intl\', use \'utils/cl-intl\' instead',
              });
            }
          });
        }
      },
    };
  },
};
