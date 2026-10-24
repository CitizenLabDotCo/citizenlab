// The saved edits not yet pushed, each with what it changed so it can be
// undone. Kept in .git (never committed, survives a restart); emptied by a
// push.
import fs from 'fs';
import path from 'path';

import type { PatchOp } from './writes';

export type FileChange = { file: string; before: string; after: string };

export type Entry = {
  id: string;
  kind: 'token' | 'style' | 'setup';
  // "Radius · panel 8px to 12px", for the list and the commit.
  label: string;
  at: number;
  files: FileChange[];
  // A token edit undoes by its inverse patch, so later edits of other
  // tokens stay.
  patch?: PatchOp[];
  // A style edit: the text written at a line, to put back when the file
  // moved on since.
  swap?: { file: string; line: number; from: string; to: string };
};

export type Journal = {
  list: () => Entry[];
  add: (e: Omit<Entry, 'id' | 'at'>) => Entry;
  remove: (id: string) => void;
  clear: () => void;
};

export const fileJournal = (file: string, now = Date.now): Journal => {
  const read = (): Entry[] => {
    try {
      const v = JSON.parse(fs.readFileSync(file, 'utf8'));
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };
  const write = (list: Entry[]) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(list, null, 2));
  };
  return {
    list: read,
    add: (e) => {
      const list = read();
      const at = now();
      const entry = { ...e, id: `${at.toString(36)}-${list.length}`, at };
      write([...list, entry]);
      return entry;
    },
    remove: (id) => write(read().filter((e) => e.id !== id)),
    clear: () => write([]),
  };
};

// A style write taken back in a file that moved on: the written text near
// its line (a later write may have added an import above) becomes the old
// text again. Undefined when it is not there once.
export const unswap = (
  text: string,
  swap: NonNullable<Entry['swap']>
): string | undefined => {
  const lines = text.split('\n');
  const hits: [number, number][] = [];
  for (let l = swap.line - 1; l <= swap.line + 3; l++) {
    const row = lines[l - 1];
    if (row === undefined) continue;
    let from = 0;
    for (;;) {
      const i = row.indexOf(swap.to, from);
      if (i < 0) break;
      hits.push([l, i]);
      from = i + 1;
    }
  }
  if (hits.length !== 1) return undefined;
  const [l, i] = hits[0];
  const row = lines[l - 1];
  lines[l - 1] = row.slice(0, i) + swap.from + row.slice(i + swap.to.length);
  return lines.join('\n');
};
