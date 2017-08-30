import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';
import { Multiloc } from 'typings';

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
      }
    }
  };
}

export interface IEvent {
  data: IEventData;
}

export interface IEvents {
  data: IEventData[];
}

export interface IUpdatedEventProperties {
  project_id?: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  location_multiloc?: Multiloc;
  start_at?: string;
  end_at?: string;
}

export function observeEvents(projectId: string, streamParams: IStreamParams<IEvents> | null = null) {
  return streams.create<IEvents>({ apiEndpoint: `${API_PATH}/projects/${projectId}/events`, ...streamParams });
}

export function observeEvent(eventId: string, streamParams: IStreamParams<IEvent> | null = null) {
  return streams.create<IEvent>({ apiEndpoint: `${apiEndpoint}/${eventId}`, ...streamParams });
}

export function updateEvent(eventId: string, object: IUpdatedEventProperties) {
  return streams.update<IEvent>(`${apiEndpoint}/${eventId}`, eventId, { event: object });
}

export function addEvent(projectId: string, object: IUpdatedEventProperties) {
  const apiEndpoint = `${API_PATH}/projects/${projectId}/events`;
  return streams.add<IEvent>(apiEndpoint, { event: object });
}

export function deleteEvent(eventId: string) {
  return streams.delete(`${apiEndpoint}/${eventId}`, eventId);
}
