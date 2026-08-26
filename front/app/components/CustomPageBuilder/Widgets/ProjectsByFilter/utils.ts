import { Multiloc } from 'typings';

// The grid falls back to its own "Currently working on" heading, which is homepage phrasing
// and wrong here. So the heading shows only once an admin has written one; until then the
// page reads as it did before the builder, with the fallback left to screen readers.
export const hasTitle = (titleMultiloc?: Multiloc) =>
  Object.values(titleMultiloc ?? {}).some((value) => !!value.trim());
