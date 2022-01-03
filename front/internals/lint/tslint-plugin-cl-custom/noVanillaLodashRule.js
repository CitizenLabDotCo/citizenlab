'use strict';
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
      return extendStatics(d, b);
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
var tslint_1 = require('tslint');
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
})(tslint_1.Rules.AbstractRule);
exports.Rule = Rule;
// The walker takes care of all the work.
var NoImportsWalker = /** @class */ (function (_super) {
  __extends(NoImportsWalker, _super);
  function NoImportsWalker() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  NoImportsWalker.prototype.visitImportDeclaration = function (node) {
    var moduleName = node.moduleSpecifier.getText().slice(1, -1);
    if (moduleName === 'lodash' || moduleName.lastIndexOf('lodash/', 0) === 0) {
      this.addFailure(
        this.createFailure(
          node.getStart(),
          node.getWidth(),
          "module 'lodash' forbidden: use 'lodash-es' instead"
        )
      );
    }
    // call the base version of this visitor to actually parse this node
    _super.prototype.visitImportDeclaration.call(this, node);
  };
  return NoImportsWalker;
})(tslint_1.RuleWalker);
