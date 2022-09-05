import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/projects`;

export interface IProjectFileData {
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

export interface IProjectFile {
  data: IProjectFileData;
}

export interface IProjectFiles {
  data: IProjectFileData[];
}

export function projectFilesStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IProjectFiles | null>({
    apiEndpoint: `${apiEndpoint}/${projectId}/files`,
    ...streamParams,
  });
}

export async function addProjectFile(
  projectId: string,
  base64: string,
  name: string,
  ordering: number | null = null
) {
  return await streams.add<IProjectFile>(`${apiEndpoint}/${projectId}/files`, {
    file: { name, ordering, file: base64 },
  });
}

export async function deleteProjectFile(projectId: string, fileId: string) {
  return await streams.delete(
    `${apiEndpoint}/${projectId}/files/${fileId}`,
    fileId
  );
}
