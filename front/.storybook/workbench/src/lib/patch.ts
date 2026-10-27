// The exact line edit of one element edit, for the send script: the scan
// finding the edit stands for, read in the file as GitHub has it now, with
// the token written in. Undefined when the line is not plain enough to edit
// without a person (a value over several lines, a spacing call site, a
// colour built in code): that change goes as a task instead.
import type { Finding } from './data';
import { Item, LineEdit, REPO, REVIEW_BASE, undoOfLineEdit } from './send';

// What the page knows of an attached token before it reads the file: the
// findings the edit can stand for and the words that pick among them.
export type EditSource = {
  // From front/, as the scan names files.
  file: string;
  story: string;
  subject: string;
  token: string;
  candidates: Pick<Finding, 'line' | 'col' | 'raw' | 'category'>[];
  words: string[];
};

// A legacy read inside a template's `${…}`, alone or as an arrow's body:
// `${(props) => props.theme.borderRadius}`, `${({ theme }) => theme.x}`.
const ARROW_HEAD =
  /^\s*(?:\(\s*\w*\s*\)|\(\s*\{[^}]*\}\s*\)|\w+)?\s*(?:=>)?\s*$/;

// Literals a token replaces in place: they only occur inside a string or a
// template (`3px`, `#fff` and `white` are not code). An rgba() that reads a
// value from code (`rgba(colors.x, 0.5)`) is code.
const LITERAL = new Set<Finding['category']>([
  'px',
  'hex',
  'rgba',
  'named-color',
]);

const at = (src: string, raw: string, col: number) => {
  const i = col - 1;
  if (src.slice(i, i + raw.length) === raw) return i;
  const first = src.indexOf(raw);
  return first >= 0 && src.indexOf(raw, first + 1) < 0 ? first : -1;
};

export const lineEditOf = (
  text: string,
  f: Pick<Finding, 'line' | 'col' | 'raw' | 'category'>,
  token: string
): { line: number; old: string; new: string } | undefined => {
  if (f.raw.includes('\n')) return undefined;
  const src = text.split('\n')[f.line - 1];
  if (src === undefined) return undefined;
  const i = at(src, f.raw, f.col);
  if (i < 0) return undefined;
  const end = i + f.raw.length;
  const read = `var(${token})`;
  let next: string | undefined;
  if (f.category.startsWith('legacy-')) {
    const open = src.lastIndexOf('${', i);
    const close = src.indexOf('}', end);
    if (
      open >= 0 &&
      close >= 0 &&
      ARROW_HEAD.test(src.slice(open + 2, i)) &&
      src.slice(end, close).trim() === '' &&
      !src.slice(open + 2, i).includes('}')
    ) {
      next = src.slice(0, open) + read + src.slice(close + 1);
    } else {
      next = `${src.slice(0, i)}'${read}'${src.slice(end)}`;
    }
  } else if (
    LITERAL.has(f.category) &&
    !(f.category === 'rgba' && /[A-Za-z_$][\w$]*\.[A-Za-z_$]/.test(f.raw))
  ) {
    next = src.slice(0, i) + read + src.slice(end);
  }
  return next === undefined || next === src
    ? undefined
    : { line: f.line, old: src, new: next };
};

// The line edit of one change: its one candidate, or the one whose line
// names the edit's row when several render the same value.
export const lineEditFrom = (
  text: string,
  s: EditSource
): LineEdit | undefined => {
  const lines = text.split('\n');
  const picks =
    s.candidates.length > 1
      ? s.candidates.filter((f) =>
          s.words.some((w) =>
            (lines[f.line - 1] ?? '').toLowerCase().includes(w)
          )
        )
      : s.candidates;
  if (picks.length !== 1) return undefined;
  const e = lineEditOf(text, picks[0], s.token);
  return (
    e && { subject: s.subject, story: s.story, file: `front/${s.file}`, ...e }
  );
};

// Items with their exact line edits, read from GitHub; an item whose line
// cannot be found or edited plainly keeps its task.
export const resolveItems = (
  items: Item[],
  load: (file: string) => Promise<string | undefined> = loadSource
): Promise<Item[]> =>
  Promise.all(
    items.map(async (i) => {
      if (!i.source) return i;
      const text = await load(i.source.file);
      const edit =
        text === undefined ? undefined : lineEditFrom(text, i.source);
      return edit ? { ...i, edit, undo: undoOfLineEdit(edit) } : i;
    })
  );

// The file as the workbench branch has it now; `file` is from front/.
export const rawUrl = (file: string, ref = REVIEW_BASE) =>
  `https://raw.githubusercontent.com/${REPO}/refs/heads/${ref}/front/${file}`;

const sources = new Map<string, Promise<string | undefined>>();

// One fetch per file per visit; undefined when GitHub does not answer.
export const loadSource = (
  file: string,
  fetcher: typeof fetch = fetch
): Promise<string | undefined> => {
  let p = sources.get(file);
  if (!p) {
    p = fetcher(rawUrl(file))
      .then((r) => (r.ok ? r.text() : undefined))
      .catch(() => undefined);
    sources.set(file, p);
  }
  return p;
};
