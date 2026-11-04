// An inline style on the canvas is a story frame's: the `style={{…}}` a
// story or a decorator draws around the component. It joins to the one
// indexed object whose entries equal the style React holds for the
// element, key for key and value for value (the index's matchStyle, copied:
// the workbench does not import scripts/). Never the nearest look-alike.
import { familyOf } from './cascade';
import type { IndexStyles, PropTrace } from './types';

type StyleObject = IndexStyles[number];

// scripts/design-system/index/styleObjects.ts isFrameFile.
export const isFrameFile = (file: string) =>
  /\.stories\.tsx?$/.test(file) ||
  (file.startsWith('.storybook/') && !file.startsWith('.storybook/workbench/'));

// scripts/design-system/index/styleObjects.ts matchStyle: the same keys,
// each value strictly equal (React keeps 18 as 18 and '18px' as '18px').
export const matchStyle = (
  objects: StyleObject[],
  style: Record<string, unknown>
): StyleObject[] => {
  const keys = Object.keys(style).filter((k) => style[k] !== undefined);
  return objects.filter((o) => {
    if (!o.entries) return false;
    const own = Object.keys(o.entries);
    return (
      own.length === keys.length &&
      keys.every((k) => o.entries?.[k] && o.entries[k].value === style[k])
    );
  });
};

// React's style key as a CSS property: paddingTop -> padding-top,
// WebkitFlex -> -webkit-flex, msFlex -> -ms-flex.
const cssName = (key: string) =>
  key.startsWith('--')
    ? key
    : key
        .replace(/^ms(?=[A-Z])/, '-ms')
        .replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export type FrameDecl =
  | { decl: NonNullable<PropTrace['decl']> }
  | { why: 'ambiguous' }
  | Record<string, never>;

// The story frame that wrote the longhand inline: its file, and the line
// of the key that sets the longhand (the last one, as React applies them
// in order), else of the object. Equal objects in several files are told
// apart by the story's own file, when it holds exactly one of them.
export const frameDecl = (
  styles: IndexStyles | undefined,
  style: Record<string, unknown> | undefined,
  longhand: string,
  storyFile?: string
): FrameDecl => {
  if (!styles || !style) return {};
  const all = matchStyle(
    styles.filter((o) => isFrameFile(o.file)),
    style
  );
  const own = all.filter((o) => o.file === storyFile);
  const hits = all.length > 1 && own.length === 1 ? own : all;
  if (hits.length > 1) return { why: 'ambiguous' };
  if (hits.length === 0) return {};
  const o = hits[0];
  const family = familyOf(longhand);
  const key = Object.keys(o.entries ?? {})
    .filter((k) => family.includes(cssName(k)))
    .pop();
  const line = key ? o.entries?.[key].loc.line ?? o.loc.line : o.loc.line;
  return {
    decl: { template: 'style', file: o.file, line, storyFrame: true },
  };
};
