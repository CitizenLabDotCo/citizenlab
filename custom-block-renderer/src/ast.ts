import ts from "typescript";

export const BLOCK_FILE_NAME = "block.tsx";

export const parseSource = (source: string): ts.SourceFile =>
  ts.createSourceFile(
    BLOCK_FILE_NAME,
    source,
    ts.ScriptTarget.ES2020,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX
  );

export interface Position {
  line: number | null;
  column: number | null;
}

export const positionOf = (
  node: ts.Node,
  sourceFile: ts.SourceFile
): Position => {
  try {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart(sourceFile)
    );
    return { line: line + 1, column: character + 1 };
  } catch {
    return { line: null, column: null };
  }
};

export const walk = (node: ts.Node, visit: (node: ts.Node) => void): void => {
  visit(node);
  node.forEachChild((child) => walk(child, visit));
};

/** The callee name of a call expression, for `foo()` and `foo.bar()` alike. */
export const calleeName = (call: ts.CallExpression): string | null => {
  const { expression } = call;
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  return null;
};

/**
 * Reads a node as a static string: a plain string literal, or a template literal
 * with no `${}` substitutions. Returns null for anything computed.
 */
export const staticStringOf = (node: ts.Node): string | null => {
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
};

/**
 * Resolves an argument to a static string, following one level of
 * `const NAME = '...'` indirection.
 *
 * Blocks are told to hoist their SQL into a single `const SQL = ` + '`...`' + `;`
 * at the top of the file, so the argument at the call site is usually an
 * identifier rather than the literal itself.
 */
export const resolveStaticString = (
  node: ts.Node,
  sourceFile: ts.SourceFile
): string | null => {
  const direct = staticStringOf(node);
  if (direct !== null) return direct;
  if (!ts.isIdentifier(node)) return null;

  const name = node.text;
  let resolved: string | null = null;

  walk(sourceFile, (candidate) => {
    if (resolved !== null) return;
    if (!ts.isVariableDeclaration(candidate)) return;
    if (!ts.isIdentifier(candidate.name) || candidate.name.text !== name)
      return;
    if (!candidate.initializer) return;

    resolved = staticStringOf(candidate.initializer);
  });

  return resolved;
};
