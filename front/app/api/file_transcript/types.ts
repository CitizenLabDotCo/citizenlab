import { Keys } from 'utils/cl-react-query/types';

import fileTranscriptKeys from './keys';

export type FileTranscriptKeys = Keys<typeof fileTranscriptKeys>;

export interface IFileTranscript {
  data: IFileTranscriptData;
}

export interface IFileTranscriptData {
  id: string;
  type: string;
  attributes: {
    // TODO: Complete once I understand what the FE is getting back.
    status: 'pending' | 'completed' | 'failed';
  };
}
