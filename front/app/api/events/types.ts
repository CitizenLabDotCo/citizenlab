import { Keys } from 'utils/cl-react-query/types';
import eventsKeys from './keys';
import { Multiloc, ILinks } from 'typings';
import { PublicationStatus } from 'api/projects/types';

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

type SortType = 'start_at' | '-start_at';

export interface InputParameters {
  projectIds?: string[];
  staticPageId?: string;
  endsOnOrAfterDate?: string;
  endsBeforeDate?: string;
  currentAndFutureOnly?: boolean;
  pastOnly?: boolean;
  pageSize?: number;
  pageNumber?: number;
  sort?: SortType;
  projectPublicationStatuses?: PublicationStatus[];
}

export interface IEvent {
  data: IEventData;
}

export interface IEvents {
  data: IEventData[];
  links: ILinks;
}

export interface IEventProperties {
  project_id?: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  location_multiloc?: Multiloc;
  start_at?: string;
  end_at?: string;
}

export interface IAddEventProperties {
  projectId: string;
  event: IEventProperties;
}

export interface IUpdateEventProperties {
  eventId: string;
  event: IEventProperties;
}
