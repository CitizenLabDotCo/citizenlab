import { Keys } from 'utils/cl-react-query/types';
import eventsKeys from './keys';
import { IStreamParams } from 'utils/streams';
import { Multiloc, ILinks } from 'typings';

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

export type IEventsStreamParams = IStreamParams & {
  queryParameters: {
    project_ids?: string[];
    ends_before_date?: string;
    ends_on_or_after_date?: string;
    sort?: 'start_at' | '-start_at';
    'page[number]'?: number;
    'page[size]'?: number;
    project_publication_statuses?: string[];
  };
};
