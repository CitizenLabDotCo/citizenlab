"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Rule = void 0;
var typescript_1 = require("typescript");
var tslint_1 = require("tslint");
var walk = function (ctx) {
    var cb = function (node) {
        if (typescript_1.isImportDeclaration(node)) {
            var moduleName = node.moduleSpecifier.getText().slice(1, -1);
            if (/^modules\/.+\/.+$/.test(moduleName)) {
                return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
            }
        }
        return typescript_1.forEachChild(node, cb);
    };
    return typescript_1.forEachChild(ctx.sourceFile, cb);
};
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        if (!/^.*app\/modules\/.+\/.+$/.test(sourceFile.fileName)) {
            return this.applyWithFunction(sourceFile, walk);
        }
    };
    Rule.FAILURE_STRING = "Can't import module code from the core app. Modules should be optional.";
    return Rule;
}(tslint_1.Rules.AbstractRule));
exports.Rule = Rule;
