import { SourceFile, ImportDeclaration } from 'typescript';
import { Rules, RuleFailure, RuleWalker } from 'tslint';

export class Rule extends Rules.AbstractRule {
  public apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NoImportsWalker(sourceFile, this.getOptions())
    );
  }
}

// The walker takes care of all the work.
class NoImportsWalker extends RuleWalker {
  public visitImportDeclaration(node: ImportDeclaration) {
    const moduleName = node.moduleSpecifier.getText().slice(1, -1);

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
    super.visitImportDeclaration(node);
  }
}
