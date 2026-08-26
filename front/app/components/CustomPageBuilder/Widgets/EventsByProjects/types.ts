import { Multiloc } from 'typings';

import { SectionBackgroundChoice } from 'components/ProjectPageBuilder/Widgets/SectionBackground';

// 'all' is the unconfigured default and shows every project's events, which is what the
// homepage shows. 'projects' picks projects directly; the other three mirror StaticPage's
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
  sectionBackground: SectionBackgroundChoice;
  titleMultiloc: Multiloc;
};
