import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/initiatives`;

export interface IInitiativeFileData {
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

export interface IInitiativeFiles {
  data: IInitiativeFileData[];
}

export function initiativeFilesStream(
  initiativeId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInitiativeFiles>({
    apiEndpoint: `${apiEndpoint}/${initiativeId}/files`,
    ...streamParams,
  });
}
