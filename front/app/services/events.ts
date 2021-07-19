import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc, ILinks } from 'typings';

const apiEndpoint = `${API_PATH}/events`;

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
    start_at_lt?: string;
    start_at_gteq?: string;
    'page[number]'?: number;
    'page[size]'?: number;
  };
};

export function eventsStream(streamParams: IEventsStreamParams | null = null) {
  return streams.get<IEvents>({
    apiEndpoint: `${API_PATH}/events`,
    ...streamParams,
  });
}

export function eventStream(
  eventId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IEvent>({
    apiEndpoint: `${apiEndpoint}/${eventId}`,
    ...streamParams,
  });
}

export function updateEvent(eventId: string, object: IUpdatedEventProperties) {
  return streams.update<IEvent>(`${apiEndpoint}/${eventId}`, eventId, {
    event: object,
  });
}

export function addEvent(projectId: string, object: IUpdatedEventProperties) {
  return streams.add<IEvent>(`${API_PATH}/projects/${projectId}/events`, {
    event: object,
  });
}

export function deleteEvent(eventId: string) {
  return streams.delete(`${apiEndpoint}/${eventId}`, eventId);
}
