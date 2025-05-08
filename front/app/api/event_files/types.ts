import { Keys } from 'utils/cl-react-query/types';

import eventFilesKeys from './keys';

export type EventFilesKeys = Keys<typeof eventFilesKeys>;

export interface IEventFileData {
  id: string;
  type: string;
  attributes: {
    file: {
      url: string;
    };
    ordering: number | null;
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

export interface IAddEventFileProperties {
  eventId: string;
  file: string;
  name: string;
  ordering?: number | null;
}

export interface IDeleteEventFileProperties {
  eventId: string;
  fileId?: string;
}
