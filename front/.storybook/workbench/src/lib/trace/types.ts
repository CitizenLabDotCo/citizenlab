// The trace engine's types: what traceElement answers for each longhand of
// the selected element, and the pieces it joins on the way (alignments of a
// component's rules with the code index, CSS text with the place each
// character came from).
import type {
  Decl,
  DefPlace,
  Expr,
  IndexLookup,
  IndexMeta,
  IndexShard,
  IndexStyles,
  Loc,
  Read,
  Template,
} from '../../../../../scripts/design-system/index/schema';

export type {
  Decl,
  DefPlace,
  Expr,
  IndexLookup,
  IndexMeta,
  IndexShard,
  IndexStyles,
  Loc,
  Read,
  Template,
};

// Why a property is not traced, in the words of the plan's table.
export type Why =
  | 'no-index'
  | 'no-fiber'
  | 'no-owner'
  | 'no-index-match'
  | 'ambiguous'
  | 'parse'
  | 'selector'
  | 'read-mismatch'
  | 'string-split'
  | 'internals-changed'
  | 'unknown-read';

export type SheetKind = 'styled' | 'global' | 'storybook' | 'other';

export type TraceStatus =
  | 'traced'
  | 'inherited'
  | 'global'
  | 'inline'
  | 'edit'
  | 'default'
  | 'untraced';

export type ViaStep = { text: string; file: string; line: number };

export type TraceSource = {
  read: Read['k'];
  // The leaf's own text in the file when the source is readable at the
  // index's commit, else a rendering of the read ('theme.borderRadius').
  text: string;
  file: string;
  line: number;
  col: number;
  start: number;
  end: number;
  themePath?: string[];
  prop?: string;
  mapKey?: string;
  // A theme or const leaf (or a concat of one with literals): where its
  // value is defined, only when the runtime value equals the static one.
  def?: { file: string; line: number };
  // The key tokens.meta.json `legacy` lists use: 'theme.borderRadius',
  // 'bo.borderRadius', 'fontSizes.base'.
  legacyKey?: string;
  // The leaf's static value from the index (Read.value), when it has one.
  staticValue?: string;
  // Template expression, then each const, call and map hop, then the leaf.
  via: ViaStep[];
};

export type Editable =
  | {
      file: string;
      start: number;
      end: number;
      context: 'template' | 'js';
      part?: number;
      lineText: string;
      line: number;
    }
  | { no: string };

export type PropTrace = {
  prop: string;
  value: string;
  status: TraceStatus;
  why?: Why;
  token?: string;
  rule?: {
    selector: string;
    atRules: string[];
    sheet: SheetKind;
    href?: string;
  };
  decl?: {
    template: string;
    file: string;
    line: number;
    name?: string;
    storyFrame: boolean;
  };
  source?: TraceSource;
  from?: Element;
  sharedBy?: string[];
  editable?: Editable;
};

export type ElementTrace = {
  owner?: { name?: string; file: string; line: number };
  props: PropTrace[];
  // Properties whose status is not 'untraced'.
  traced: number;
  total: number;
  commit: string;
};

// ------------------------------------------------------------ the join

// An outer expression crossed on the way to a piece of CSS text: the
// Container's `${(props) => getButtonStyle(props)}`, an inlined css`` const,
// a media helper's call site.
export type Hop = { template: Template; expr: number };

// Where a piece of CSS text came from: a quasi of an indexed template
// (`k` its index), or what an expression of one produced at runtime
// (`value` the whole of it).
export type Origin =
  | { kind: 'quasi'; template: Template; k: number; path: Hop[] }
  | {
      kind: 'expr';
      template: Template;
      k: number;
      value: string;
      path: Hop[];
    };

// One string of a flattened componentStyle. `at` is its offset inside its
// origin (the quasi, or the expression's whole value).
export type Piece = { text: string; origin?: Origin; at: number };

// A run of characters from one origin, as offsets inside it.
export type Span = { origin: Origin; from: number; to: number };

// Each entry of a componentStyle's rules, placed in an indexed template.
export type Slot =
  | { kind: 'quasi'; template: Template; k: number; path: Hop[] }
  | {
      kind: 'expr';
      template: Template;
      k: number;
      path: Hop[];
      // A helper wrapper's function (isRtl): the call site's template, which
      // its result is aligned to.
      slot?: string;
    };

export type Alignment = { template: Template; slots: Slot[] };
