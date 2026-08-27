import { Multiloc } from 'typings';

// 'all' is the default and matches the homepage widget. The last three mirror StaticPage's
// projects_filter_type enum, so a legacy page's filter maps across without translation.
export type EventsSelectionMode =
  | 'all'
  | 'projects'
  | 'global_topics'
  | 'areas'
  | 'spaces';

export type EventsByProjectsProps = {
  mode: EventsSelectionMode;
  ids: string[];
  titleMultiloc: Multiloc;
};
