import { Multiloc } from 'typings';

// Mirrors StaticPage's projects_filter_type enum minus 'no_filter', so a legacy page's
// filter maps onto the widget without translation.
export type ProjectsFilterType = 'global_topics' | 'areas' | 'spaces';

export type ProjectsByFilterProps = {
  filterType: ProjectsFilterType;
  ids: string[];
  titleMultiloc: Multiloc;
};

// The grid falls back to its own "Currently working on" heading, which is homepage phrasing
// and wrong here. So the heading shows only once an admin has written one; until then the
// page reads as it did before the builder, with the fallback left to screen readers.
export const hasTitle = (titleMultiloc?: Multiloc) =>
  Object.values(titleMultiloc ?? {}).some((value) => !!value.trim());
