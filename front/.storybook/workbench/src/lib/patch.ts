// The exact line edit of one element edit, for the send script: the
// expression the trace points at (trace/codemod.ts), read in the file as
// GitHub has it now, with the token written in. When the codemod cannot
// prove the edit is only the token (the line moved, the range is not a whole
// value), the change goes as a task instead, with the reason.
import type { EditTrace, Parse } from './trace/codemod';
import { lineEditOf } from './trace/codemod';
import { Item, LineEdit, REPO, REVIEW_BASE, undoOfLineEdit } from './send';

// What the page knows of an attached token before it reads the file: the
// traced expression it replaces.
export type EditSource = {
  // From front/, as the index names files.
  file: string;
  story: string;
  subject: string;
  token: string;
  trace: EditTrace;
};

// @babel/parser, loaded only when a change is sent.
export const loadParse = async (): Promise<Parse> => {
  const { parse } = await import('@babel/parser');
  return (code) =>
    parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      tokens: true,
    }) as unknown as ReturnType<Parse>;
};

// The line edit of one change, or why a person makes it.
export const lineEditFrom = (
  text: string,
  s: EditSource,
  parse: Parse
): LineEdit | { byHand: string } => {
  const e = lineEditOf(text, s.trace, s.token, parse);
  return 'byHand' in e
    ? e
    : { subject: s.subject, story: s.story, file: `front/${s.file}`, ...e };
};

// Items with their exact line edits, read from GitHub; an item whose line
// cannot be edited plainly keeps its task, with the reason after it.
export const resolveItems = async (
  items: Item[],
  load: (file: string) => Promise<string | undefined> = loadSource,
  parser: () => Promise<Parse> = loadParse
): Promise<Item[]> => {
  if (!items.some((i) => i.source)) return items;
  const parse = await parser();
  return Promise.all(
    items.map(async (i) => {
      if (!i.source) return i;
      const text = await load(i.source.file);
      if (text === undefined) {
        return { ...i, task: `${i.task}\nby hand: GitHub did not answer` };
      }
      const edit = lineEditFrom(text, i.source, parse);
      return 'byHand' in edit
        ? { ...i, task: `${i.task}\nby hand: ${edit.byHand}` }
        : { ...i, edit, undo: undoOfLineEdit(edit) };
    })
  );
};

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
