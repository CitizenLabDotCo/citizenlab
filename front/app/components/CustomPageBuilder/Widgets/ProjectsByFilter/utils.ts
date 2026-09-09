import { Multiloc } from 'typings';

// The grid's own fallback heading is homepage phrasing, so show a heading only once an admin
// has written one — as the legacy section does. Not `isEmptyMultiloc`, which counts a
// whitespace-only value as written.
export const hasTitle = (titleMultiloc?: Multiloc) =>
  Object.values(titleMultiloc ?? {}).some((value) => !!value.trim());
