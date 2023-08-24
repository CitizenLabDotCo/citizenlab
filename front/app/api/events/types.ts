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
    address_2_multiloc: Multiloc;
    address_1: string | null | undefined;
    location_point_geojson: GeoJSON.Point | undefined | null;
    start_at: string;
    end_at: string;
    created_at: string;
    updated_at: string;
    attendees_count: number;
  };
  relationships: {
    project: {
      data: {
        id: string;
        type: string;
      };
    };
    user_attendance: {
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
  attendeeId?: string;
  ongoing_during?: (string | null)[]; // [startDate, endDate], use null for open ended
}
export interface IEvent {
  data: IEventData;
}

export interface IICSFile {
  data: IICSData;
}

export interface IICSData {
  id: string;
  type: string;
  attributes: {
    ics: string;
  };
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
  address_2_multiloc?: Multiloc;
  address_1?: string | null;
  location_point_geojson?: GeoJSON.Point | null;
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
