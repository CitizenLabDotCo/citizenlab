import { BlockDiagnostic } from './types';

// Static safety checks on block source. This is a net for accidents and a
// steering signal for the AI loop, not a security boundary: same-realm code
// can evade source checks. The trust model (feature flag, admin-only
// authoring) is the boundary.
const RULES: { rule: string; re: RegExp; message: string }[] = [
  {
    rule: 'no-eval',
    re: /\beval\s*\(|new\s+Function\s*\(/,
    message: 'eval and new Function are not allowed in blocks.',
  },
  {
    rule: 'no-network',
    re: /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/,
    message:
      'Direct network access is not allowed. Use the gv-sdk data hooks (see data_uses).',
  },
  {
    rule: 'no-storage',
    re: /document\.cookie|localStorage|sessionStorage|indexedDB/,
    message: 'Cookies and browser storage are not allowed in blocks.',
  },
  {
    rule: 'no-window-escape',
    re: /window\.(top|parent|open)\b/,
    message: 'window.top, window.parent and window.open are not allowed.',
  },
  {
    rule: 'no-dynamic-import',
    re: /\bimport\s*\(/,
    message: 'Dynamic import() is not allowed in blocks.',
  },
  {
    rule: 'no-raw-html',
    re: /dangerouslySetInnerHTML|createElement\(\s*['"]script['"]/,
    message: 'Injecting raw HTML or script elements is not allowed.',
  },
];

const IMPORT_RE = /^\s*(?:import|export)\b[^'"]*['"]([^'"]+)['"]/;
const ALLOWED_IMPORTS = new Set(['gv-sdk']);

export const lintBlockSource = (source: string): BlockDiagnostic[] => {
  const diagnostics: BlockDiagnostic[] = [];

  source.split('\n').forEach((text, index) => {
    const line = index + 1;

    RULES.forEach(({ rule, re, message }) => {
      if (re.test(text)) {
        diagnostics.push({ line, message, rule });
      }
    });

    const importMatch = IMPORT_RE.exec(text);
    if (importMatch && !ALLOWED_IMPORTS.has(importMatch[1])) {
      diagnostics.push({
        line,
        rule: 'imports-whitelist',
        message: `Only 'gv-sdk' can be imported (found '${importMatch[1]}').`,
      });
    }
  });

  return diagnostics;
};
