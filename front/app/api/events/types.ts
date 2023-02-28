import { Keys } from 'utils/cl-react-query/types';
import eventsKeys from './keys';
import { Multiloc, ILinks } from 'typings';
import { PublicationStatus } from 'services/projects';

export type EventsKeys = Keys<typeof eventsKeys>;
export interface IEventData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    location_multiloc: Multiloc;
    start_at: string;
    end_at: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    project: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

export interface QueryParameters {
  project_ids?: string[] | undefined;
  ends_before_date?: string | undefined;
  ends_on_or_after_date?: string | undefined;
  sort?: 'start_at' | '-start_at' | undefined;
  'page[number]'?: number | undefined;
  'page[size]'?: number | undefined;
  project_publication_statuses?: string[] | undefined;
}

type sort = 'newest' | 'oldest';

export interface InputParameters {
  projectIds?: string[];
  staticPageId?: string;
  currentAndFutureOnly?: boolean;
  pastOnly?: boolean;
  pageSize?: number;
  sort?: sort;
  projectPublicationStatuses?: PublicationStatus[];
}

export interface IEvent {
  data: IEventData;
}

export interface IEvents {
  data: IEventData[];
  links: ILinks;
}

export interface IUpdatedEventProperties {
  project_id?: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  location_multiloc?: Multiloc;
  start_at?: string;
  end_at?: string;
}
