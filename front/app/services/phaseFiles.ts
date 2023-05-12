import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/phases`;

export interface IPhaseFileData {
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

export interface IPhaseFile {
  data: IPhaseFileData;
}

export interface IPhaseFiles {
  data: IPhaseFileData[];
}

export function phaseFilesStream(
  phaseId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPhaseFiles>({
    apiEndpoint: `${apiEndpoint}/${phaseId}/files`,
    ...streamParams,
  });
}
