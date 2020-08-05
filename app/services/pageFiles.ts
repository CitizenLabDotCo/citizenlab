import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/pages`;

export interface IPageFileData {
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

export interface IPageFile {
  data: IPageFileData;
}

export interface IPageFiles {
  data: IPageFileData[];
}

export function pageFilesStream(
  pageId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPageFiles>({
    apiEndpoint: `${apiEndpoint}/${pageId}/files`,
    ...streamParams,
  });
}

export function pageFileStream(
  pageId: string,
  fileId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPageFile>({
    apiEndpoint: `${apiEndpoint}/${pageId}/files/${fileId}`,
    ...streamParams,
  });
}

export function addPageFile(
  pageId: string,
  base64: string,
  name: string,
  ordering: number | null = null
) {
  return streams.add<IPageFile>(`${apiEndpoint}/${pageId}/files`, {
    file: { name, ordering, file: base64 },
  });
}

export function deletePageFile(pageId: string, fileId: string) {
  return streams.delete(`${apiEndpoint}/${pageId}/files/${fileId}`, fileId);
}
