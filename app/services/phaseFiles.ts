import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/phases`;

export interface IPhaseFileData {
  id: string;
  type: string;
  attributes: {
    file: {
      url: string,
    }
    ordering: string | null,
    name: string,
    size: number,
    created_at: string,
    updated_at: string,
  };
}

export interface IPhaseFile {
  data: IPhaseFileData;
}

export interface IPhaseFiles {
  data: IPhaseFileData[];
}

export function phaseFilesStream(projectId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IPhaseFiles>({ apiEndpoint: `${apiEndpoint}/${projectId}/files`, ...streamParams });
}

export function phaseFileStream(projectId: string, fileId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IPhaseFile>({ apiEndpoint: `${apiEndpoint}/${projectId}/files/${fileId}`, ...streamParams });
}

export function addPhaseFile(projectId: string, base64: string, name: string, ordering: number | null = null) {
  return streams.add<IPhaseFile>(`${apiEndpoint}/${projectId}/files`, { file: { name, ordering, file: base64 } });
}

export function deletePhaseFile(projectId: string, fileId: string) {
  return streams.delete(`${apiEndpoint}/${projectId}/files/${fileId}`, fileId);
}
