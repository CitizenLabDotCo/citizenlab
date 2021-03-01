import { SourceFile, Node, forEachChild, isImportDeclaration } from 'typescript';
import { Rules, RuleFailure, WalkContext } from 'tslint';

const walk = (ctx: WalkContext<void>) => {

  const cb = (node: Node): void => {
    if (isImportDeclaration(node)) {
      const moduleName = node.moduleSpecifier.getText().slice(1, -1);
      if (/^modules\/.+\/.+$/.test(moduleName)) {
        return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
      }
    }
    return forEachChild(node, cb);
  };

  return forEachChild(ctx.sourceFile, cb);
};


export class Rule extends Rules.AbstractRule {
  public static FAILURE_STRING = "Can't import module code from the core app. Modules should be optional.";

  public apply(sourceFile: SourceFile): RuleFailure[] {
    if (!/^.*app\/modules\/.+\/.+$/.test(sourceFile.fileName)) {
      return this.applyWithFunction(sourceFile, walk);
    }
  }
}
