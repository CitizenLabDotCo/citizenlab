import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/events`;

export interface IEventFileData {
  id: string;
  type: string;
  attributes: {
    file: {
      url: string;
    };
    ordering: string | null;
    name: string;
    size: number;
    created_at: string;
    updated_at: string;
  };
}

export interface IEventFile {
  data: IEventFileData;
}

export interface IEventFiles {
  data: IEventFileData[];
}

export function eventFilesStream(
  eventId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IEventFiles>({
    apiEndpoint: `${apiEndpoint}/${eventId}/files`,
    ...streamParams,
  });
}

export function addEventFile(
  eventId: string,
  base64: string,
  name: string,
  ordering: number | null = null
) {
  return streams.add<IEventFile>(`${apiEndpoint}/${eventId}/files`, {
    file: { name, ordering, file: base64 },
  });
}

export function deleteEventFile(eventId: string, fileId: string) {
  return streams.delete(`${apiEndpoint}/${eventId}/files/${fileId}`, fileId);
}
