'use strict';
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (d, b) {
          d.__proto__ = b;
        }) ||
      function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
      };
    return function (d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
exports.__esModule = true;
var Lint = require('tslint');
var Rule = /** @class */ (function (_super) {
  __extends(Rule, _super);
  function Rule() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  Rule.prototype.apply = function (sourceFile) {
    return this.applyWithWalker(
      new NoImportsWalker(sourceFile, this.getOptions())
    );
  };
  return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
// The walker takes care of all the work.
var NoImportsWalker = /** @class */ (function (_super) {
  __extends(NoImportsWalker, _super);
  function NoImportsWalker() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  NoImportsWalker.prototype.visitImportDeclaration = function (node) {
    var _this = this;
    var moduleName = node.moduleSpecifier.getText().slice(1, -1);
    if (moduleName === 'react-router') {
      node.importClause &&
        node.importClause.getChildren().forEach(function (c) {
          if (/Link/.test(c.getText())) {
            _this.addFailure(
              _this.createFailure(
                node.getStart(),
                node.getWidth(),
                "Link import statement from 'react-router' forbidden: use 'utils/cl-router' instead"
              )
            );
          }
          if (/browserHistory/.test(c.getText())) {
            _this.addFailure(
              _this.createFailure(
                node.getStart(),
                node.getWidth(),
                "browserHistory import statement from 'react-router' forbidden: use 'utils/cl-router' instead"
              )
            );
          }
        });
    }
    // call the base version of this visitor to actually parse this node
    _super.prototype.visitImportDeclaration.call(this, node);
  };
  return NoImportsWalker;
})(Lint.RuleWalker);
