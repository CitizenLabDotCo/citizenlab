import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new NoImportsWalker(sourceFile, this.getOptions()));
  }
}

// The walker takes care of all the work.
class NoImportsWalker extends Lint.RuleWalker {
  public visitImportDeclaration(node: ts.ImportDeclaration) {
    const moduleName = node.moduleSpecifier.getText().slice(1,-1);

    if (moduleName === 'react-intl') {

      node.importClause && node.importClause.getChildren().forEach((c) => {
        if (/FormattedMessage/.test(c.getText())) {
          this.addFailure(this.createFailure(
            node.getStart(),
            node.getWidth(),
            'FormattedMessage import statement from \'react-intl\' forbidden: use \'utils/cl-intl\' instead'
          ));
        }
        if (/injectIntl/.test(c.getText())) {
          this.addFailure(this.createFailure(
            node.getStart(),
            node.getWidth(),
            'injectIntl import statement from \'react-intl\' forbidden: use \'utils/cl-intl\' instead'
          ));
        }
      });
    }

    // call the base version of this visitor to actually parse this node
    super.visitImportDeclaration(node);
  }
}
