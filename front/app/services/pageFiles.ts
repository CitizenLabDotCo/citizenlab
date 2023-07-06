import streams, { IStreamParams } from 'utils/streams';
import { customPagesEndpoint as apiEndpoint } from './customPages';

export interface ICustomPageFileData {
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

export interface ICustomPageFile {
  data: ICustomPageFileData;
}

export interface ICustomPageFiles {
  data: ICustomPageFileData[];
}

export function pageFilesStream(
  pageId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<ICustomPageFiles>({
    apiEndpoint: `${apiEndpoint}/${pageId}/files`,
    ...streamParams,
  });
}
