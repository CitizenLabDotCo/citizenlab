/*
 * The code index (npm run ds:index): every style template the canvas can
 * render, its CSS declarations, and what each interpolated value reads.
 * Written by index.ts into .storybook/static/design-index/; the workbench
 * imports these types only.
 */

/** A source range. `start`/`end` are file offsets; lines are 1-based, cols 0-based. */
export type Loc = {
  start: number;
  end: number;
  line: number;
  col: number;
  endLine: number;
  endCol: number;
};

export type TemplateKind = 'styled' | 'css' | 'global' | 'keyframes' | 'string';

export type Template = {
  /** `${file}:${loc.line}:${loc.col}` */
  id: string;
  /** From front/: 'app/component-library/components/Button/index.tsx' */
  file: string;
  loc: Loc;
  /**
   * styled: styled.x`` / styled(X)`` (with .attrs() .withConfig() <T>);
   * css: css`` from 'styled-components' and the call sites of the styleUtils
   * helpers (media.*``, isRtl``); global: createGlobalStyle``; keyframes:
   * keyframes``; string: an untagged template literal (or string literal) a
   * style template's function returns, directly or through a same-file
   * function.
   */
  kind: TemplateKind;
  /** 'button' for styled.button, 'Box' for styled(Box), 'media.phone', 'isRtl' */
  tag?: string;
  /** The const it is bound to ('Container'), or the function returning it ('getButtonStyle') */
  name?: string;
  /** Cooked strings, exactly what the tag function receives. */
  quasis: string[];
  exprs: Expr[];
  decls: Decl[];
};

export type ExprShape = 'fn' | 'value' | 'css' | 'component' | 'helper' | 'unknown';

export type Expr = {
  /** The expression inside ${ } */
  loc: Loc;
  text: string;
  /**
   * fn: an arrow or function expression, or an identifier bound to one;
   * value: a literal or a statically known value; css: a css`` template
   * (`css` = its id); component: a styled component (`component` = its
   * template id when indexed, else its name); helper: a styleUtils helper
   * call site (`wrapper` = the helper's css template id, `slot` = the call
   * site's template id); unknown: anything else.
   */
  shape: ExprShape;
  /** shape 'value': the static value, when known ('' false null undefined drop to '') */
  value?: string;
  css?: string;
  component?: string;
  wrapper?: string;
  slot?: string;
  read: Read;
};

export type ConstSource =
  | 'colors'
  | 'bo'
  | 'fontSizes'
  | 'stylingConsts'
  | 'viewportWidths';

export type Read =
  | { k: 'literal'; value: string; loc: Loc }
  | { k: 'token'; name: string; loc: Loc }
  | { k: 'theme'; path: string[]; value?: string; loc: Loc }
  | { k: 'const'; source: ConstSource; path: string[]; value?: string; loc: Loc }
  | { k: 'prop'; name: string; loc: Loc }
  | { k: 'or' | 'and' | 'nullish'; items: Read[]; loc: Loc }
  | { k: 'cond'; test: Read; then: Read; else: Read; loc: Loc }
  | {
      k: 'switch';
      on: Read;
      cases: { value: string; then: Read }[];
      default?: Read;
      loc: Loc;
    }
  | { k: 'eq' | 'neq' | 'not'; left: Read; right?: Read; loc: Loc }
  | { k: 'concat'; parts: Read[]; loc: Loc }
  | {
      k: 'map';
      key: Read;
      field: string;
      table: Record<string, Read>;
      loc: Loc;
    }
  | { k: 'call'; callee: string; args: Read[]; returns?: Read; loc: Loc }
  | { k: 'template'; id: string; loc: Loc }
  | { k: 'unknown'; text: string; loc: Loc };

export type ReadKind = Read['k'];

export type Decl = {
  /** Lowercase; custom properties as written; '${n}' when the property itself is a hole */
  prop: string;
  /** Nesting path as written, holes as ${n}: [] at top level, ['&.fullWidth'], ['${3}'] */
  selectors: string[];
  /** e.g. ['@media (max-width: ${0}px)'] */
  atRules: string[];
  /** Where the property name starts */
  loc: Loc;
  /** Static text and expression indexes in order: ['', 4, ''] for `border-radius: ${borderRadius};` */
  value: (string | number)[];
  important: boolean;
};

/** files/<fnv1a32 of the file path>.json */
export type IndexShard = { file: string; templates: Template[] };

/** A theme or const leaf's definition place (values.ts defs). */
export type DefPlace = { file: string; line: number; col: number };

/** meta.json */
export type IndexMeta = {
  version: 1;
  commit: string;
  files: number;
  templates: number;
  decls: number;
  exprs: number;
  exprsKnown: number;
  unknownTags: number;
  /** Dotted theme path ('borderRadius', 'fontSizes.base') -> where it is defined */
  themeDefs: Record<string, DefPlace>;
  /** Dotted const path ('bo.borderRadius', 'colors.primary') -> where it is defined */
  constDefs: Record<string, DefPlace>;
};

/** lookup.json: fnv1a32 of a quasi -> template ids */
export type IndexLookup = Record<string, string[]>;
