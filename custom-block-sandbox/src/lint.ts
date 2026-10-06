import ts from "typescript";

import { calleeName, parseSource, positionOf, walk } from "./ast.ts";
import type { Diagnostic, MessageCatalogues } from "./types.ts";

/**
 * Static checks on a block's source.
 *
 * This is a net for accidents and a steering signal for the model, not a security
 * boundary: a bundle runs in the same realm as the app, so source checks can be
 * evaded by anyone determined to. The trust model — the feature flag, and authoring
 * limited to staff — is the boundary.
 */

/** Globals a block has no business touching. */
const FORBIDDEN_IDENTIFIERS: Record<string, { rule: string; message: string }> =
  {
    fetch: {
      rule: "no-network",
      message:
        "Direct network access is not allowed. Read data with useReportingData from gv-sdk.",
    },
    XMLHttpRequest: {
      rule: "no-network",
      message: "XMLHttpRequest is not allowed.",
    },
    WebSocket: { rule: "no-network", message: "WebSocket is not allowed." },
    EventSource: { rule: "no-network", message: "EventSource is not allowed." },
    eval: { rule: "no-eval", message: "eval is not allowed." },
    Function: {
      rule: "no-eval",
      message: "The Function constructor is not allowed.",
    },
    window: {
      rule: "no-globals",
      message: "window is not available to a block. Use the gv-sdk hooks.",
    },
    document: {
      rule: "no-globals",
      message: "document is not available to a block. Render with JSX instead.",
    },
    localStorage: {
      rule: "no-storage",
      message: "localStorage is not allowed.",
    },
    sessionStorage: {
      rule: "no-storage",
      message: "sessionStorage is not allowed.",
    },
    indexedDB: { rule: "no-storage", message: "indexedDB is not allowed." },
  };

const MESSAGE_LOOKUP = "msg";

const isJsxText = (node: ts.Node): node is ts.JsxText => ts.isJsxText(node);

export interface LintResult {
  diagnostics: Diagnostic[];
  /** Every key the source passes to msg(), for the catalogue checks. */
  usedMessageKeys: string[];
}

export const lint = (
  source: string,
  messages: MessageCatalogues,
  locales: string[]
): LintResult => {
  const sourceFile = parseSource(source);
  const diagnostics: Diagnostic[] = [];
  const usedMessageKeys = new Set<string>();

  const report = (node: ts.Node, rule: string, message: string) => {
    diagnostics.push({
      kind: "lint",
      ...positionOf(node, sourceFile),
      rule,
      message,
    });
  };

  walk(sourceFile, (node) => {
    // Only 'gv-sdk' may be imported. esbuild also rejects this, but saying it
    // here gives the model the line number.
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const specifier = node.moduleSpecifier;
      if (
        specifier &&
        ts.isStringLiteral(specifier) &&
        specifier.text !== "gv-sdk"
      ) {
        report(
          node,
          "imports-allowlist",
          `Only 'gv-sdk' can be imported (found '${specifier.text}').`
        );
      }
      return;
    }

    if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        report(
          node,
          "no-dynamic-import",
          "Dynamic import() is not allowed in a block."
        );
      }

      if (calleeName(node) === MESSAGE_LOOKUP) {
        const [first] = node.arguments;
        if (first && ts.isStringLiteral(first)) {
          usedMessageKeys.add(first.text);
        } else if (first) {
          report(
            node,
            "static-message-keys",
            "msg() takes a plain string literal, so the keys a block needs can be checked."
          );
        }
      }
      return;
    }

    // `new Function('...')`
    if (
      ts.isNewExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "Function"
    ) {
      report(node, "no-eval", "The Function constructor is not allowed.");
      return;
    }

    if (
      ts.isJsxAttribute(node) &&
      node.name.getText(sourceFile) === "dangerouslySetInnerHTML"
    ) {
      report(
        node,
        "no-raw-html",
        "dangerouslySetInnerHTML is not allowed. Render text as JSX children."
      );
      return;
    }

    // A visible string that did not come from msg() is a string that cannot be
    // translated. Attributes are left alone: dataKey="month" and variant="h3"
    // are configuration, not copy.
    if (isJsxText(node) && node.text.trim().length > 0) {
      report(
        node,
        "translated-strings",
        `Visible text must come from msg(): found ${JSON.stringify(
          node.text.trim()
        )}.`
      );
      return;
    }

    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isStringLiteral(node.expression) &&
      node.expression.text.trim().length > 0 &&
      node.parent &&
      !ts.isJsxAttribute(node.parent)
    ) {
      report(
        node,
        "translated-strings",
        `Visible text must come from msg(): found ${JSON.stringify(
          node.expression.text
        )}.`
      );
      return;
    }

    if (ts.isIdentifier(node)) {
      const forbidden = FORBIDDEN_IDENTIFIERS[node.text];
      if (!forbidden) return;
      // Only flag reads of the global, not `foo.fetch` or `{ fetch: … }`.
      const parent = node.parent;
      if (
        parent &&
        ts.isPropertyAccessExpression(parent) &&
        parent.name === node
      )
        return;
      if (parent && ts.isPropertyAssignment(parent) && parent.name === node)
        return;
      if (parent && ts.isBindingElement(parent) && parent.name === node) return;

      report(node, forbidden.rule, forbidden.message);
    }
  });

  diagnostics.push(...catalogueDiagnostics(usedMessageKeys, messages, locales));

  return { diagnostics, usedMessageKeys: [...usedMessageKeys] };
};

/**
 * A key the source uses but a locale does not define renders as the raw key to a
 * reader in that language; a key a catalogue defines but nothing uses is dead
 * weight that later looks like a missing call site.
 */
const catalogueDiagnostics = (
  usedKeys: Set<string>,
  messages: MessageCatalogues,
  locales: string[]
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const at = (message: string): Diagnostic => ({
    kind: "message",
    line: null,
    column: null,
    message,
  });

  locales.forEach((locale) => {
    const catalogue = messages[locale];
    if (!catalogue) {
      diagnostics.push(at(`messages has no catalogue for locale '${locale}'.`));
      return;
    }

    const missing = [...usedKeys].filter((key) => !(key in catalogue));
    if (missing.length > 0) {
      diagnostics.push(
        at(`messages['${locale}'] is missing the keys: ${missing.join(", ")}.`)
      );
    }
  });

  const definedKeys = new Set(
    Object.values(messages).flatMap((catalogue) => Object.keys(catalogue))
  );
  const unused = [...definedKeys].filter((key) => !usedKeys.has(key));
  if (unused.length > 0) {
    diagnostics.push(
      at(`messages defines keys the source never uses: ${unused.join(", ")}.`)
    );
  }

  return diagnostics;
};
