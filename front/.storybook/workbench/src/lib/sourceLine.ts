// The line under a Design tab value: where the code writes it, in words,
// from the traces of the longhands the row sets (lib/trace). A row whose
// longhands trace to different places says so; one that is not traced says
// why. Every file:line links to GitHub at the commit the index was made from.
import { REPO } from './componentPanels';
import type { EditTrace } from './trace/codemod';
import type { Editable, PropTrace, Why } from './trace/types';

export type Place = { file: string; line: number; href: string };

export type SourceLine = {
  status: PropTrace['status'];
  // The leaf's read kind (literal, theme, const, prop, map, …).
  read?: string;
  // The words before the place: "props.theme.borderRadius", "not traced:
  // …", "browser default".
  text: string;
  place?: Place;
  // Where a theme or const leaf's value is defined.
  def?: Place;
  storyFrame?: boolean;
  // The other table keys that reach the same map entry (bo-secondary, …).
  shared?: string[];
  // Inherited: the ancestor that sets it.
  from?: Element;
  // The longhands trace to more than one place: this line is the first's.
  differ?: boolean;
  token?: string;
  legacyKey?: string;
  // What an attach writes in the code: the traced expression, the same for
  // every longhand. Absent with `byHand` when a person must make the edit.
  trace?: EditTrace;
  byHand?: string;
};

export const WHY_WORDS: Record<Why, string> = {
  'no-index': 'this build has no code index',
  'no-fiber': 'React holds no record of this element',
  'no-owner': 'no styled component owns the winning rule',
  'no-index-match': "the component's styles match no indexed template",
  ambiguous: 'the styles match more than one indexed template',
  parse: 'the winning value could not be read',
  selector: "the winning rule's selector is not one the template writes",
  'read-mismatch': 'the value read from the code differs from the rendered one',
  'string-split':
    'the value is cut from a longer string the index cannot split',
  'internals-changed': 'styled-components changed; tracing is off',
  'unknown-read': 'the code computes it in a way the index does not follow',
};

// The file on GitHub at the commit, at a line. `file` is relative to front/.
export const commitLink = (commit: string, file: string, line: number) =>
  `${REPO}/blob/${commit}/front/${file}#L${line}`;

// The last two parts of a path: Button/index.tsx, utils/styleUtils.ts.
export const shortFile = (file: string) => file.split('/').slice(-2).join('/');

const placeOf = (commit: string, file?: string, line?: number) =>
  file && line
    ? { file, line, href: commitLink(commit, file, line) }
    : undefined;

const sameSource = (a: PropTrace, b: PropTrace) =>
  a.status === b.status &&
  a.why === b.why &&
  a.source?.file === b.source?.file &&
  a.source?.start === b.source?.start &&
  a.source?.end === b.source?.end &&
  a.decl?.file === b.decl?.file &&
  a.decl?.line === b.decl?.line &&
  a.from === b.from &&
  JSON.stringify(a.editable) === JSON.stringify(b.editable);

// The edit of a row's code, or why there is none: every longhand must point
// at the same expression.
const traceOf = (
  e: Editable | undefined,
  differ: boolean,
  commit: string,
  text?: string
): { trace?: EditTrace; byHand?: string } => {
  if (differ) return { byHand: 'its sides are written in different places' };
  if (!e) return {};
  if ('no' in e) return { byHand: e.no };
  return { trace: { commit, ...e, ...(text ? { text } : {}) } };
};

const words = (t: PropTrace): string => {
  const s = t.source;
  switch (t.status) {
    case 'edit':
      return 'your edit, listed in Changes';
    case 'default':
      return 'browser default';
    case 'attribute':
      return `${t.prop} attribute on <${
        t.attrOn ?? 'svg'
      }>, set by the code that renders it`;
    case 'inherited':
      return 'inherited';
    case 'global': {
      // A long selector list by its first three.
      const parts = (t.rule?.selector ?? '').split(',').map((x) => x.trim());
      const shown =
        parts.length > 3
          ? `${parts.slice(0, 3).join(', ')}, …`
          : parts.join(', ');
      return `global CSS ${shown}`.trim();
    }
    case 'untraced': {
      const why = t.why ? WHY_WORDS[t.why] : 'no reason recorded';
      return `not traced: ${why}${s?.text ? ` (${s.text})` : ''}`;
    }
    case 'inline':
      return t.decl?.storyFrame ? 'story frame' : 'inline style';
    default:
      break;
  }
  if (!s) return t.decl?.storyFrame ? 'story frame' : 'traced';
  if (s.read === 'prop') {
    return `prop ${s.prop ?? s.text}, set where the component is used`;
  }
  const frame = t.decl?.storyFrame ? 'story frame: ' : '';
  return s.mapKey ? `${frame}${s.text} for ${s.mapKey}` : `${frame}${s.text}`;
};

/** The source line of a row from the traces of its longhands. */
export const sourceLine = (
  traces: PropTrace[],
  commit: string
): SourceLine | undefined => {
  const [t] = traces;
  if (!t) return undefined;
  const s = t.source;
  const differ = traces.some((x) => !sameSource(x, t));
  const line: SourceLine = {
    status: t.status,
    read: s?.read,
    text: words(t),
    token: traces.every((x) => x.token === t.token) ? t.token : undefined,
    legacyKey: s?.legacyKey,
    ...(t.status === 'traced'
      ? traceOf(t.editable, differ, commit, s?.legacyKey ?? s?.text)
      : {}),
    storyFrame: t.decl?.storyFrame || undefined,
    from: t.from,
    differ: differ || undefined,
  };
  // The place: the leaf where the value is written; for a prop or a story
  // frame with no leaf, the declaration's own line.
  line.place = s
    ? placeOf(commit, s.file, s.line)
    : placeOf(commit, t.decl?.file, t.decl?.line);
  if (s?.def) line.def = placeOf(commit, s.def.file, s.def.line);
  const shared = (t.sharedBy ?? []).filter((k) => k !== s?.mapKey);
  if (shared.length) line.shared = shared;
  return line;
};

/** "traced 9 of 12" for the Source header. */
export const tracedWords = (traced: number, total: number) =>
  `traced ${traced} of ${total}`;
