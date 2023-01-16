import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/ideas`;

export interface IIdeaFileData {
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

export interface IIdeaFile {
  data: IIdeaFileData;
}

export interface IIdeaFiles {
  data: IIdeaFileData[];
}

export function ideaFilesStream(
  ideaId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IIdeaFiles>({
    apiEndpoint: `${apiEndpoint}/${ideaId}/files`,
    ...streamParams,
  });
}

export function addIdeaFile(
  ideaId: string,
  base64: string,
  name: string,
  ordering: number | null = null
) {
  return streams.add<IIdeaFile>(`${apiEndpoint}/${ideaId}/files`, {
    file: { name, ordering, file: base64 },
  });
}

export function deleteIdeaFile(ideaId: string, fileId: string) {
  return streams.delete(`${apiEndpoint}/${ideaId}/files/${fileId}`, fileId);
}
