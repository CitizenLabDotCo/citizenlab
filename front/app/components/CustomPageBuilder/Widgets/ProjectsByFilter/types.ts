import { Multiloc } from 'typings';

import { SectionBackgroundChoice } from 'components/ProjectPageBuilder/Widgets/SectionBackground';

// Mirrors StaticPage's projects_filter_type enum minus 'no_filter', so a legacy page's
// filter maps onto the widget without translation.
export type ProjectsFilterType = 'global_topics' | 'areas' | 'spaces';

export type ProjectsByFilterProps = {
  filterType: ProjectsFilterType;
  ids: string[];
  titleMultiloc: Multiloc;
  sectionBackground: SectionBackgroundChoice;
};
