import { Multiloc, SupportedLocale } from 'typings';

// The grid's own fallback heading is homepage phrasing, so show a heading only once an admin
// has written one — as the legacy section does. Not `isEmptyMultiloc`, which counts a
// whitespace-only value as written.
//
// Per visitor locale, not per multiloc: the grid localizes the heading with that fallback, and
// `getLocalizedWithFallback` returns it as soon as the visitor's own locale is missing rather
// than trying the others. A heading written in one locale only would otherwise show every other
// locale the homepage phrasing.
export const hasTitle = (
  titleMultiloc: Multiloc | undefined,
  locale: SupportedLocale
) => !!titleMultiloc?.[locale]?.trim();
