import { Multiloc } from 'typings';

export type EventsSource =
  | 'all'
  | 'currentProject'
  | 'projects'
  | 'global_topics'
  | 'areas'
  | 'spaces';
export type EventsTimeFilter = 'upcoming' | 'past';
export type EventsLimit = number | 'all';
export type EventsPublicationStatus = 'published' | 'archived';

export type EventsProps = {
  source?: EventsSource;
  ids?: string[];
  titleMultiloc?: Multiloc;
  timeFilters?: EventsTimeFilter[];
  limit?: EventsLimit;
  projectPublicationStatuses?: EventsPublicationStatus[];
  showEmptyMessage?: boolean;
  renderFrame?: (contents: React.ReactNode) => React.ReactNode;
};
