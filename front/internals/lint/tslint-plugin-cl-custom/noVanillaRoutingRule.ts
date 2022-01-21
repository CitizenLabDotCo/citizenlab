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

    if (moduleName === 'react-router') {
      node.importClause &&
        node.importClause.getChildren().forEach((c) => {
          if (/Link/.test(c.getText())) {
            this.addFailure(
              this.createFailure(
                node.getStart(),
                node.getWidth(),
                "Link import statement from 'react-router' forbidden: use 'utils/cl-router' instead"
              )
            );
          }
          if (/browserHistory/.test(c.getText())) {
            this.addFailure(
              this.createFailure(
                node.getStart(),
                node.getWidth(),
                "browserHistory import statement from 'react-router' forbidden: use 'utils/cl-router' instead"
              )
            );
          }
        });
    }

    // call the base version of this visitor to actually parse this node
    super.visitImportDeclaration(node);
  }
}
